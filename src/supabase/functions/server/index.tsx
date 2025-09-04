import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to get user from auth token
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Health check endpoint
app.get("/make-server-1184471d/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth routes
app.post("/make-server-1184471d/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile with extended data
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      bio: '',
      location: '',
      phone: '',
      website: '',
      avatar: '',
      socialLinks: {},
      preferences: {
        emailNotifications: true,
        publicProfile: true,
        showEmail: false,
        showPhone: false,
        showLocation: true,
      },
      createdAt: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Blog routes
app.post("/make-server-1184471d/blogs", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { title, content, tags, isDraft } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const blogId = crypto.randomUUID();
    const slug = generateSlug(title);
    const readingTime = calculateReadingTime(content);
    const now = new Date().toISOString();

    const blog = {
      id: blogId,
      title,
      content,
      slug,
      tags: tags || [],
      isDraft: isDraft || false,
      readingTime,
      authorId: user.id,
      createdAt: now,
      updatedAt: now,
      views: 0
    };

    await kv.set(`blog:${blogId}`, blog);
    
    // Add to user's blogs list
    const userBlogs = await kv.get(`user:${user.id}:blogs`) || [];
    userBlogs.push(blogId);
    await kv.set(`user:${user.id}:blogs`, userBlogs);

    // Index for search if not draft
    if (!isDraft) {
      await kv.set(`blog:published:${blogId}`, {
        id: blogId,
        title,
        tags,
        slug,
        authorId: user.id,
        createdAt: now
      });
    }

    return c.json({ blog });
  } catch (error) {
    console.log('Create blog error:', error);
    return c.json({ error: "Internal server error creating blog" }, 500);
  }
});

app.get("/make-server-1184471d/blogs", async (c) => {
  try {
    const search = c.req.query('search') || '';
    const tag = c.req.query('tag') || '';
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const authorId = c.req.query('authorId') || '';

    let blogIds: string[] = [];

    if (authorId) {
      // Get blogs by specific author (including drafts if it's the author themselves)
      const user = await getAuthenticatedUser(c.req.raw);
      const isOwner = user?.id === authorId;
      
      const userBlogs = await kv.get(`user:${authorId}:blogs`) || [];
      const blogPromises = userBlogs.map((id: string) => kv.get(`blog:${id}`));
      const blogs = await Promise.all(blogPromises);
      
      const filteredBlogs = blogs.filter(blog => 
        blog && (isOwner || !blog.isDraft)
      );
      
      return c.json({ blogs: filteredBlogs, total: filteredBlogs.length });
    }

    // Get published blogs
    const publishedBlogs = await kv.getByPrefix('blog:published:');
    
    for (const blogIndex of publishedBlogs) {
      const blog = await kv.get(`blog:${blogIndex.id}`);
      if (blog) {
        // Search filtering
        if (search && !blog.title.toLowerCase().includes(search.toLowerCase()) && 
            !blog.content.toLowerCase().includes(search.toLowerCase())) {
          continue;
        }
        
        // Tag filtering
        if (tag && !blog.tags.includes(tag.toLowerCase())) {
          continue;
        }
        
        blogIds.push(blog.id);
      }
    }

    // Sort by creation date (newest first)
    const blogPromises = blogIds.map(id => kv.get(`blog:${id}`));
    const blogs = await Promise.all(blogPromises);
    const validBlogs = blogs.filter(blog => blog).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = validBlogs.slice(startIndex, endIndex);

    // Get author info for each blog
    const blogsWithAuthors = await Promise.all(
      paginatedBlogs.map(async (blog) => {
        const author = await kv.get(`user:${blog.authorId}`);
        return {
          ...blog,
          author: author ? {
            id: author.id,
            name: author.name
          } : null
        };
      })
    );

    return c.json({ 
      blogs: blogsWithAuthors, 
      total: validBlogs.length,
      page,
      totalPages: Math.ceil(validBlogs.length / limit)
    });
  } catch (error) {
    console.log('Get blogs error:', error);
    return c.json({ error: "Internal server error fetching blogs" }, 500);
  }
});

app.get("/make-server-1184471d/blogs/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    
    // Find blog by slug
    const publishedBlogs = await kv.getByPrefix('blog:published:');
    let targetBlogId = null;
    
    for (const blogIndex of publishedBlogs) {
      if (blogIndex.slug === slug) {
        targetBlogId = blogIndex.id;
        break;
      }
    }
    
    if (!targetBlogId) {
      return c.json({ error: "Blog not found" }, 404);
    }
    
    const blog = await kv.get(`blog:${targetBlogId}`);
    if (!blog) {
      return c.json({ error: "Blog not found" }, 404);
    }

    // Increment view count
    blog.views = (blog.views || 0) + 1;
    await kv.set(`blog:${targetBlogId}`, blog);

    // Get author info
    const author = await kv.get(`user:${blog.authorId}`);
    
    return c.json({
      blog: {
        ...blog,
        author: author ? {
          id: author.id,
          name: author.name
        } : null
      }
    });
  } catch (error) {
    console.log('Get blog by slug error:', error);
    return c.json({ error: "Internal server error fetching blog" }, 500);
  }
});

app.put("/make-server-1184471d/blogs/:id", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const blogId = c.req.param('id');
    const { title, content, tags, isDraft } = await c.req.json();
    
    const existingBlog = await kv.get(`blog:${blogId}`);
    if (!existingBlog) {
      return c.json({ error: "Blog not found" }, 404);
    }
    
    if (existingBlog.authorId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const slug = generateSlug(title);
    const readingTime = calculateReadingTime(content);
    
    const updatedBlog = {
      ...existingBlog,
      title,
      content,
      slug,
      tags: tags || [],
      isDraft: isDraft !== undefined ? isDraft : existingBlog.isDraft,
      readingTime,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`blog:${blogId}`, updatedBlog);

    // Update search index
    if (!updatedBlog.isDraft) {
      await kv.set(`blog:published:${blogId}`, {
        id: blogId,
        title,
        tags,
        slug,
        authorId: user.id,
        createdAt: existingBlog.createdAt
      });
    } else {
      // Remove from published index if it was published before
      await kv.del(`blog:published:${blogId}`);
    }

    return c.json({ blog: updatedBlog });
  } catch (error) {
    console.log('Update blog error:', error);
    return c.json({ error: "Internal server error updating blog" }, 500);
  }
});

app.delete("/make-server-1184471d/blogs/:id", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const blogId = c.req.param('id');
    
    const blog = await kv.get(`blog:${blogId}`);
    if (!blog) {
      return c.json({ error: "Blog not found" }, 404);
    }
    
    if (blog.authorId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Delete blog
    await kv.del(`blog:${blogId}`);
    await kv.del(`blog:published:${blogId}`);
    
    // Remove from user's blogs list
    const userBlogs = await kv.get(`user:${user.id}:blogs`) || [];
    const updatedUserBlogs = userBlogs.filter((id: string) => id !== blogId);
    await kv.set(`user:${user.id}:blogs`, updatedUserBlogs);

    // Delete related comments
    const comments = await kv.getByPrefix(`comment:${blogId}:`);
    for (const comment of comments) {
      await kv.del(`comment:${blogId}:${comment.id}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete blog error:', error);
    return c.json({ error: "Internal server error deleting blog" }, 500);
  }
});

// Comment routes
app.post("/make-server-1184471d/blogs/:blogId/comments", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const blogId = c.req.param('blogId');
    const { content } = await c.req.json();
    
    if (!content?.trim()) {
      return c.json({ error: "Comment content is required" }, 400);
    }

    const blog = await kv.get(`blog:${blogId}`);
    if (!blog || blog.isDraft) {
      return c.json({ error: "Blog not found" }, 404);
    }

    const commentId = crypto.randomUUID();
    const comment = {
      id: commentId,
      blogId,
      content: content.trim(),
      authorId: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(`comment:${blogId}:${commentId}`, comment);

    // Get author info
    const author = await kv.get(`user:${user.id}`);
    
    return c.json({
      comment: {
        ...comment,
        author: {
          id: author.id,
          name: author.name
        }
      }
    });
  } catch (error) {
    console.log('Create comment error:', error);
    return c.json({ error: "Internal server error creating comment" }, 500);
  }
});

app.get("/make-server-1184471d/blogs/:blogId/comments", async (c) => {
  try {
    const blogId = c.req.param('blogId');
    
    const comments = await kv.getByPrefix(`comment:${blogId}:`);
    
    // Get author info for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await kv.get(`user:${comment.authorId}`);
        return {
          ...comment,
          author: author ? {
            id: author.id,
            name: author.name
          } : null
        };
      })
    );

    // Sort by creation date (newest first)
    commentsWithAuthors.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ comments: commentsWithAuthors });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: "Internal server error fetching comments" }, 500);
  }
});

// User profile routes
app.put("/make-server-1184471d/users/:userId", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId');
    
    // Check if user is updating their own profile
    if (user.id !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }
    
    const existingUser = await kv.get(`user:${userId}`);
    if (!existingUser) {
      return c.json({ error: "User not found" }, 404);
    }

    const {
      name,
      email,
      bio,
      location,
      phone,
      website,
      avatar,
      socialLinks,
      preferences
    } = await c.req.json();
    
    // Validate required fields
    if (!name?.trim()) {
      return c.json({ error: "Name is required" }, 400);
    }

    // Update user profile
    const updatedUser = {
      ...existingUser,
      name: name.trim(),
      email: email?.trim() || existingUser.email,
      bio: bio?.trim() || '',
      location: location?.trim() || '',
      phone: phone?.trim() || '',
      website: website?.trim() || '',
      avatar: avatar?.trim() || '',
      socialLinks: socialLinks || {},
      preferences: {
        ...existingUser.preferences,
        ...preferences
      },
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${userId}`, updatedUser);

    return c.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        phone: updatedUser.phone,
        website: updatedUser.website,
        avatar: updatedUser.avatar,
        socialLinks: updatedUser.socialLinks,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.log('Update user profile error:', error);
    return c.json({ error: "Internal server error updating profile" }, 500);
  }
});

app.get("/make-server-1184471d/users/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get user's published blogs count
    const userBlogs = await kv.get(`user:${userId}:blogs`) || [];
    const blogPromises = userBlogs.map((id: string) => kv.get(`blog:${id}`));
    const blogs = await Promise.all(blogPromises);
    const publishedBlogs = blogs.filter(blog => blog && !blog.isDraft);

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        website: user.website,
        avatar: user.avatar,
        socialLinks: user.socialLinks || {},
        preferences: user.preferences || {
          emailNotifications: true,
          publicProfile: true,
          showEmail: false,
          showPhone: false,
          showLocation: true,
        },
        createdAt: user.createdAt,
        blogCount: publishedBlogs.length
      }
    });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: "Internal server error fetching user" }, 500);
  }
});

// Get popular tags
app.get("/make-server-1184471d/tags", async (c) => {
  try {
    const publishedBlogs = await kv.getByPrefix('blog:published:');
    const tagCounts: Record<string, number> = {};

    for (const blogIndex of publishedBlogs) {
      const blog = await kv.get(`blog:${blogIndex.id}`);
      if (blog && blog.tags) {
        for (const tag of blog.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    const tags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    return c.json({ tags });
  } catch (error) {
    console.log('Get tags error:', error);
    return c.json({ error: "Internal server error fetching tags" }, 500);
  }
});

Deno.serve(app.fetch);