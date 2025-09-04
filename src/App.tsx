import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { AuthForm } from './components/AuthForm'
import { MarkdownEditor } from './components/MarkdownEditor'
import { BlogGrid } from './components/BlogGrid'
import { BlogViewer } from './components/BlogViewer'
import { CommentSection } from './components/CommentSection'
import { UserProfile } from './components/UserProfile'
import { ProfileSettings } from './components/ProfileSettings'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Skeleton } from './components/ui/skeleton'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner@2.0.3'
import { supabase } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  PenTool,
  ArrowRight,
  Star,
  Clock,
  Eye
} from 'lucide-react'

interface User {
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
  createdAt?: string
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
  updatedAt?: string
  views?: number
  author?: {
    id: string
    name: string
    avatar?: string
  }
}

interface Comment {
  id: string
  blogId: string
  content: string
  authorId: string
  createdAt: string
  author?: {
    id: string
    name: string
  }
}

type Route = 'home' | 'auth' | 'new-blog' | 'edit-blog' | 'view-blog' | 'my-blogs' | 'profile' | 'user-profile'

export default function App() {
  // Core state
  const [currentRoute, setCurrentRoute] = useState<Route>('home')
  const [user, setUser] = useState<User | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  // Blog state
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [userBlogs, setUserBlogs] = useState<Blog[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)

  // Comments state
  const [comments, setComments] = useState<Comment[]>([])

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Initialize app
  useEffect(() => {
    initializeApp()
  }, [])

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !user) {
        await handleOAuthUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setCurrentRoute('home')
      }
    })

    return () => subscription.unsubscribe()
  }, [user])

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  // Load data when route or filters change
  useEffect(() => {
    if (currentRoute === 'home') {
      loadBlogs()
      loadPopularTags()
    } else if (currentRoute === 'my-blogs' && user) {
      loadUserBlogs(user.id)
    }
  }, [currentRoute, searchQuery, activeTag, currentPage, user])

  const initializeApp = async () => {
    try {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await handleOAuthUser(session.user)
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleOAuthUser = async (authUser: any) => {
    try {
      // Check if user exists in our system
      let userData = await fetchUserData(authUser.id)
      
      if (!userData && authUser.email) {
        // Create user profile for OAuth users
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/signup`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({ 
                email: authUser.email, 
                password: 'oauth-user-' + authUser.id, // Temporary password for OAuth users
                name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                isOAuthUser: true
              })
            }
          )
          
          if (response.ok) {
            userData = await fetchUserData(authUser.id)
          }
        } catch (error) {
          console.error('Error creating OAuth user profile:', error)
        }
      }
      
      if (userData) {
        setUser(userData)
        setCurrentRoute('home')
        if (authUser.app_metadata?.provider === 'google') {
          toast.success('Successfully signed in with Google!')
        }
      }
    } catch (error) {
      console.error('Error handling OAuth user:', error)
    }
  }

  const fetchUserData = async (userId: string) => {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/users/${userId}`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          bio: data.user.bio,
          location: data.user.location,
          phone: data.user.phone,
          website: data.user.website,
          avatar: data.user.avatar,
          socialLinks: data.user.socialLinks || {},
          preferences: data.user.preferences || {
            emailNotifications: true,
            publicProfile: true,
            showEmail: false,
            showPhone: false,
            showLocation: true,
          },
          createdAt: data.user.createdAt
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout when fetching user data')
      } else {
        console.error('Failed to fetch user data:', error)
      }
    }
    return null
  }

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      // Add default timeout if not provided
      const controller = new AbortController()
      if (!options.signal) {
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        options.signal = controller.signal
        
        // Clear timeout if request completes
        const originalSignal = options.signal
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            clearTimeout(timeoutId)
            reject(new Error('Request timeout'))
          }, 15000)
        })
      }

      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          ...options.headers,
        },
      })
    } catch (error) {
      console.error('Request failed:', error)
      throw error
    }
  }

  // Google OAuth handler
  const handleGoogleAuth = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })

      if (error) {
        console.error('Google OAuth error:', error)
        toast.error('Failed to sign in with Google. Please try again.')
        throw error
      }
      // OAuth will redirect, so no need to handle success here
    } catch (error) {
      console.error('Google OAuth error:', error)
      throw error
    }
  }

  // Auth functions
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return false
      }

      if (data.user) {
        const userData = await fetchUserData(data.user.id)
        if (userData) {
          setUser(userData)
          setCurrentRoute('home')
          toast.success('Successfully signed in!')
          return true
        }
      }

      toast.error('Failed to load user data')
      return false
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during sign in')
      return false
    }
  }

  const handleSignup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
        }
      )

      if (response.ok) {
        const data = await response.json()
        
        // Sign in the user after successful signup
        const signInResult = await handleLogin(email, password)
        if (signInResult) {
          toast.success('Account created successfully!')
          return true
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to create account')
      }

      return false
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An error occurred during sign up')
      return false
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCurrentRoute('home')
      toast.success('Successfully signed out')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to sign out')
    }
  }

  // Blog functions
  const loadBlogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (activeTag) params.append('tag', activeTag)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs)
        setTotalPages(data.totalPages || 1)
      } else {
        toast.error('Failed to load blogs')
      }
    } catch (error) {
      console.error('Failed to load blogs:', error)
      toast.error('Failed to load blogs')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserBlogs = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs?authorId=${userId}`
      )

      if (response.ok) {
        const data = await response.json()
        setUserBlogs(data.blogs)
      } else {
        toast.error('Failed to load your blogs')
      }
    } catch (error) {
      console.error('Failed to load user blogs:', error)
      toast.error('Failed to load your blogs')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPopularTags = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/tags`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPopularTags(data.tags)
      }
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  const loadBlogBySlug = async (slug: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs/${slug}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCurrentBlog(data.blog)
        loadComments(data.blog.id)
      } else {
        toast.error('Blog not found')
        setCurrentRoute('home')
      }
    } catch (error) {
      console.error('Failed to load blog:', error)
      toast.error('Failed to load blog')
      setCurrentRoute('home')
    } finally {
      setIsLoading(false)
    }
  }

  const saveBlog = async (blogData: { title: string; content: string; tags: string[]; isDraft: boolean }) => {
    try {
      const isEditing = !!editingBlog
      const url = isEditing 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs/${editingBlog.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs`
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await makeAuthenticatedRequest(url, {
        method,
        body: JSON.stringify(blogData)
      })

      if (response.ok) {
        const data = await response.json()
        const action = isEditing ? 'updated' : 'created'
        const status = blogData.isDraft ? 'draft' : 'published'
        
        toast.success(`Blog ${action} and saved as ${status}!`)
        
        setEditingBlog(null)
        setCurrentRoute(user ? 'my-blogs' : 'home')
        
        // Refresh data
        if (currentRoute === 'my-blogs') {
          loadUserBlogs(user!.id)
        } else {
          loadBlogs()
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save blog')
      }
    } catch (error) {
      console.error('Failed to save blog:', error)
      toast.error('Failed to save blog')
    }
  }

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return
    }

    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs/${blogId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        toast.success('Blog deleted successfully')
        setCurrentRoute('my-blogs')
        loadUserBlogs(user!.id)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete blog')
      }
    } catch (error) {
      console.error('Failed to delete blog:', error)
      toast.error('Failed to delete blog')
    }
  }

  // Comment functions
  const loadComments = async (blogId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs/${blogId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const addComment = async (content: string) => {
    if (!currentBlog) return

    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs/${currentBlog.id}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ content })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        toast.success('Comment added successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    }
  }

  // User profile functions
  const loadUserProfile = async (userId: string) => {
    setIsLoading(true)
    try {
      // Load user profile
      const userResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserProfile(userData.user)

        // Load user's blogs
        const blogsResponse = await makeAuthenticatedRequest(
          `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/blogs?authorId=${userId}`
        )

        if (blogsResponse.ok) {
          const blogsData = await blogsResponse.json()
          setUserBlogs(blogsData.blogs)
        }
      } else {
        toast.error('User not found')
        setCurrentRoute('home')
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      toast.error('Failed to load user profile')
      setCurrentRoute('home')
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation functions
  const handleNavigate = (route: string, params?: any) => {
    if (route === 'view-blog' && params?.slug) {
      setCurrentRoute('view-blog')
      loadBlogBySlug(params.slug)
    } else if (route === 'edit-blog' && params?.blog) {
      setEditingBlog(params.blog)
      setCurrentRoute('edit-blog')
    } else if (route === 'user-profile' && params?.userId) {
      setViewingUserId(params.userId)
      setCurrentRoute('user-profile')
      loadUserProfile(params.userId)
    } else {
      setCurrentRoute(route as Route)
      setCurrentBlog(null)
      setEditingBlog(null)
      setUserProfile(null)
      setViewingUserId(null)
    }
  }

  const handleBlogClick = (blog: Blog) => {
    if (currentRoute === 'my-blogs' || (user && blog.author?.id === user.id)) {
      // Owner viewing their blog - go to edit if it's a draft, view if published
      if (blog.isDraft) {
        handleNavigate('edit-blog', { blog })
      } else {
        handleNavigate('view-blog', { slug: blog.slug })
      }
    } else {
      // Public view
      handleNavigate('view-blog', { slug: blog.slug })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    setActiveTag('')
  }

  const handleTagFilter = (tag: string) => {
    setActiveTag(tag)
    setCurrentPage(1)
    setSearchQuery('')
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveTag('')
    setCurrentPage(1)
  }

  const handleShare = () => {
    if (currentBlog) {
      const url = `${window.location.origin}/#${currentBlog.slug}`
      navigator.clipboard.writeText(url)
      toast.success('Blog URL copied to clipboard!')
    }
  }

  // Profile functions
  const saveProfile = async (profileData: Partial<User>) => {
    if (!user) return

    try {
      const response = await makeAuthenticatedRequest(
        `https://${projectId}.supabase.co/functions/v1/make-server-1184471d/users/${user.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(profileData)
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUser(prev => ({ ...prev, ...data.user }))
        toast.success('Profile updated successfully!')
        setCurrentRoute('my-blogs') // Redirect to user's blog page
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    }
  }

  // Loading screen
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold">BlogVerse</h1>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onSearch={handleSearch}
        onTagFilter={handleTagFilter}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        popularTags={popularTags}
      />

      <main className={currentRoute === 'auth' ? '' : 'container mx-auto px-4 py-8'}>
        {/* Home Page */}
        {currentRoute === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" style={{ height : '60px'}}>
                Welcome to BlogVerse
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Share your voice without distractions. BlogVerse gives you a seamless way to write, format, and publish your thoughts effortlessly.
              </p>
              
              {!user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => handleNavigate('auth')}
                    className="flex items-center gap-2"
                  >
                    <PenTool className="w-5 h-5" />
                    Start Writing
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setSearchQuery('')}
                  >
                    Explore Blogs
                  </Button>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => handleNavigate('new-blog')}
                  className="flex items-center gap-2"
                >
                  <PenTool className="w-5 h-5" />
                  Write New Blog
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{blogs.length}</div>
                    <div className="text-sm text-muted-foreground">Published Blogs</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Array.from(new Set(blogs.map(b => b.author?.id))).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Writers</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {blogs.reduce((total, blog) => total + (blog.views || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blogs Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {searchQuery ? `Search results for "${searchQuery}"` :
                   activeTag ? `Posts tagged with #${activeTag}` :
                   'Latest Blogs'}
                </h2>
                
                {(searchQuery || activeTag) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <BlogGrid
                blogs={blogs}
                isLoading={isLoading}
                onBlogClick={handleBlogClick}
                onTagClick={handleTagFilter}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                activeTag={activeTag}
                searchQuery={searchQuery}
                onClearFilters={clearFilters}
                emptyTitle={searchQuery || activeTag ? "No matching blogs found" : "No blogs yet"}
                emptyDescription={
                  searchQuery || activeTag 
                    ? "Try adjusting your search terms or browse all blogs."
                    : "Be the first to share your thoughts with the community!"
                }
                showCreateButton={!!user}
                onCreateClick={() => handleNavigate('new-blog')}
              />
            </div>
          </div>
        )}

        {/* Auth Page */}
        {currentRoute === 'auth' && (
          <AuthForm
            onLogin={handleLogin}
            onSignup={handleSignup}
            onGoogleAuth={handleGoogleAuth}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {/* New Blog Page */}
        {currentRoute === 'new-blog' && user && (
          <MarkdownEditor
            onSave={saveBlog}
            onCancel={() => handleNavigate('home')}
          />
        )}

        {/* Edit Blog Page */}
        {currentRoute === 'edit-blog' && editingBlog && user && (
          <MarkdownEditor
            title={editingBlog.title}
            content={editingBlog.content}
            tags={editingBlog.tags}
            isDraft={editingBlog.isDraft}
            onSave={saveBlog}
            onCancel={() => handleNavigate('my-blogs')}
          />
        )}

        {/* View Blog Page */}
        {currentRoute === 'view-blog' && currentBlog && (
          <div className="space-y-8">
            <BlogViewer
              blog={currentBlog}
              isOwner={user?.id === currentBlog.author?.id}
              onBack={() => handleNavigate('home')}
              onEdit={() => handleNavigate('edit-blog', { blog: currentBlog })}
              onShare={handleShare}
              onDelete={user?.id === currentBlog.author?.id ? () => deleteBlog(currentBlog.id) : undefined}
            />
            
            <CommentSection
              blogId={currentBlog.id}
              comments={comments}
              currentUser={user}
              onAddComment={addComment}
            />
          </div>
        )}

        {/* My Blogs Page */}
        {currentRoute === 'my-blogs' && user && (
          <UserProfile
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              bio: user.bio,
              location: user.location,
              phone: user.phone,
              website: user.website,
              avatar: user.avatar,
              socialLinks: user.socialLinks,
              preferences: user.preferences,
              createdAt: user.createdAt || new Date().toISOString(),
              blogCount: userBlogs.filter(b => !b.isDraft).length
            }}
            blogs={userBlogs}
            isOwnProfile={true}
            isLoading={isLoading}
            currentUser={user}
            onBlogClick={handleBlogClick}
            onEditProfile={() => handleNavigate('profile')}
            onCreateBlog={() => handleNavigate('new-blog')}
          />
        )}

        {/* User Profile Page */}
        {currentRoute === 'user-profile' && userProfile && (
          <UserProfile
            user={userProfile}
            blogs={userBlogs.filter(b => !b.isDraft)} // Only show published blogs for others
            isOwnProfile={user?.id === userProfile.id}
            isLoading={isLoading}
            currentUser={user}
            onBlogClick={handleBlogClick}
            onCreateBlog={() => handleNavigate('new-blog')}
          />
        )}

        {/* Profile Settings Page */}
        {currentRoute === 'profile' && user && (
          <ProfileSettings
            user={{
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
              createdAt: user.createdAt || new Date().toISOString()
            }}
            onSave={saveProfile}
            onBack={() => handleNavigate('my-blogs')}
            isLoading={isLoading}
          />
        )}

        {/* 404 fallback */}
        {!['home', 'auth', 'new-blog', 'edit-blog', 'view-blog', 'my-blogs', 'profile', 'user-profile'].includes(currentRoute) && (
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
            <Button onClick={() => handleNavigate('home')}>
              Go Home
            </Button>
          </div>
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  )
}