import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { BlogGrid } from './BlogGrid'
import { User, Calendar, BookOpen, Edit, MapPin, Globe, Mail, Phone, Twitter, Github, Linkedin, Instagram, Youtube, ExternalLink } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email?: string
  bio?: string
  location?: string
  phone?: string
  website?: string
  avatar?: string
  socialLinks?: {
    twitter?: string
    github?: string
    linkedin?: string
    instagram?: string
    youtube?: string
  }
  preferences?: {
    emailNotifications: boolean
    publicProfile: boolean
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
  }
  createdAt: string
  blogCount: number
}

interface Blog {
  id: string
  title: string
  content: string
  slug: string
  isDraft?: boolean
  tags: string[]
  readingTime: number
  createdAt: string
  views?: number
  author?: {
    id: string
    name: string
    avatar?: string
  }
}

interface UserProfileProps {
  user: UserData
  blogs: Blog[]
  isOwnProfile?: boolean
  isLoading?: boolean
  currentUser?: {
    id: string
    name: string
  } | null
  onBlogClick: (blog: Blog) => void
  onEditProfile?: () => void
  onCreateBlog?: () => void
}

export function UserProfile({
  user,
  blogs,
  isOwnProfile = false,
  isLoading = false,
  currentUser,
  onBlogClick,
  onEditProfile,
  onCreateBlog
}: UserProfileProps) {
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getTotalViews = () => {
    return blogs.reduce((total, blog) => total + (blog.views || 0), 0)
  }

  const getPublishedBlogs = () => {
    return blogs.filter(blog => !blog.isDraft)
  }

  const getDraftBlogs = () => {
    return blogs.filter(blog => blog.isDraft)
  }

  const publishedBlogs = getPublishedBlogs()
  const draftBlogs = getDraftBlogs()
  const totalViews = getTotalViews()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.bio && (
                    <p className="text-muted-foreground mt-2 max-w-md">{user.bio}</p>
                  )}
                  
                  {/* Contact Information */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    {user.location && user.preferences?.showLocation !== false && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.email && (isOwnProfile || user.preferences?.showEmail) && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.phone && (isOwnProfile || user.preferences?.showPhone) && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {isOwnProfile && onEditProfile && (
                  <Button 
                    variant="outline" 
                    onClick={onEditProfile}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatJoinDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Links */}
          {user.socialLinks && Object.entries(user.socialLinks).some(([_, url]) => url) && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Social Links
              </h3>
              <div className="flex flex-wrap gap-3">
                {user.socialLinks.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {user.socialLinks.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a
                    href={user.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {user.socialLinks.youtube && (
                  <a
                    href={user.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{publishedBlogs.length}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>

            {isOwnProfile && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-secondary-foreground">{draftBlogs.length}</div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
            )}

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-accent-foreground">{totalViews}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {publishedBlogs.reduce((total, blog) => total + blog.readingTime, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Min Reading</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blog Sections */}
      {isOwnProfile ? (
        <div className="space-y-8">
          {/* Drafts Section */}
          {draftBlogs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Edit className="w-6 h-6" />
                  Drafts ({draftBlogs.length})
                </h2>
                {onCreateBlog && (
                  <Button onClick={onCreateBlog}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    New Blog
                  </Button>
                )}
              </div>
              
              <BlogGrid
                blogs={draftBlogs}
                isLoading={isLoading}
                showAuthor={false}
                variant="compact"
                onBlogClick={onBlogClick}
                emptyTitle="No drafts"
                emptyDescription="You don't have any draft blogs yet."
                showCreateButton={true}
                onCreateClick={onCreateBlog}
              />
            </div>
          )}

          {/* Published Blogs Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Published ({publishedBlogs.length})
              </h2>
              {draftBlogs.length === 0 && onCreateBlog && (
                <Button onClick={onCreateBlog}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  New Blog
                </Button>
              )}
            </div>

            <BlogGrid
              blogs={publishedBlogs}
              isLoading={isLoading}
              showAuthor={false}
              onBlogClick={onBlogClick}
              emptyTitle="No published blogs"
              emptyDescription="You haven't published any blogs yet."
              showCreateButton={true}
              onCreateClick={onCreateBlog}
            />
          </div>
        </div>
      ) : (
        // Public profile - only published blogs
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Published Blogs ({publishedBlogs.length})
            </h2>
          </div>

          <BlogGrid
            blogs={publishedBlogs}
            isLoading={isLoading}
            showAuthor={false}
            onBlogClick={onBlogClick}
            emptyTitle="No published blogs"
            emptyDescription={`${user.name} hasn't published any blogs yet.`}
          />
        </div>
      )}
    </div>
  )
}