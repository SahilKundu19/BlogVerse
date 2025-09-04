import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Separator } from './ui/separator'
import { AlertCircle, BookOpen, Eye, Users, TrendingUp, PenTool, ArrowRight, Zap, Shield, Palette, Search, MessageSquare, Globe, Camera, BarChart3 } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { toast } from 'sonner@2.0.3'

interface AuthFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>
  onSignup: (email: string, password: string, name: string) => Promise<boolean>
  onGoogleAuth?: () => Promise<void>
  onCancel: () => void
}

export function AuthForm({ onLogin, onSignup, onGoogleAuth, onCancel }: AuthFormProps) {
  const [isSignIn, setIsSignIn] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ email: '', password: '', confirmPassword: '', name: '', phone: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentSlide, setCurrentSlide] = useState(0)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Slide content data
  const slides = [
    {
      title: "Introducing new features",
      description: "Analyzing previous trends ensures that businesses always make the right decision. And as the scale of the decision and its impact magnifies...",
      features: [
        "Markdown-powered editor with live preview",
        "Advanced analytics and reader insights", 
        "SEO optimization and social sharing"
      ],
      cards: [
        {
          title: "2.5k",
          subtitle: "📊 Blog Analytics",
          icon: TrendingUp,
          details: "Views this month",
          trend: "↗ +4.8%",
          progress: 75
        },
        {
          title: "1.2k", 
          subtitle: "👥 Active Readers",
          icon: Users,
          details: "Engagement rate",
          trend: "89%",
          progress: 85
        }
      ]
    },
    {
      title: "Future Development",
      description: "Exciting new features coming soon to enhance your blogging experience and make content creation even more powerful and intuitive...",
      features: [
        "AI-powered writing assistant and suggestions",
        "Advanced collaboration tools for teams",
        "Custom themes and branding options"
      ],
      cards: [
        {
          title: "AI",
          subtitle: "🤖 Smart Assistant",
          icon: Zap,
          details: "Writing suggestions",
          trend: "Coming Soon",
          progress: 60
        },
        {
          title: "Pro",
          subtitle: "⚡ Premium Features",
          icon: Shield,
          details: "Advanced tools",
          trend: "Q2 2025",
          progress: 40
        }
      ]
    },
    {
      title: "Enhanced Experience",
      description: "Building the ultimate platform for creators with advanced features, seamless integrations, and powerful tools to grow your audience...",
      features: [
        "Multi-language support and translations",
        "Enhanced search and discovery features",
        "Real-time collaboration and comments"
      ],
      cards: [
        {
          title: "Global",
          subtitle: "🌍 Multi-language",
          icon: Globe,
          details: "Reach worldwide",
          trend: "20+ Languages",
          progress: 70
        },
        {
          title: "Social",
          subtitle: "💬 Community",
          icon: MessageSquare,
          details: "Reader engagement",
          trend: "+125%",
          progress: 90
        }
      ]
    }
  ]

  const handleGoogleAuth = async () => {
    if (onGoogleAuth) {
      setGoogleLoading(true)
      try {
        await onGoogleAuth()
      } catch (error) {
        console.error('Google OAuth error:', error)
        toast.error('Failed to sign in with Google. Please try again.')
        setGoogleLoading(false)
      }
      // Don't set loading false here since OAuth will redirect
    } else {
      // Fallback to direct Supabase call
      setGoogleLoading(true)
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google'
        })

        if (error) {
          console.error('Google OAuth error:', error)
          toast.error('Failed to sign in with Google. Please try again.')
          setGoogleLoading(false)
        }
        // Don't set loading false here since OAuth will redirect
      } catch (error) {
        console.error('Google OAuth error:', error)
        toast.error('Failed to sign in with Google. Please try again.')
        setGoogleLoading(false)
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!loginForm.email) {
      newErrors.loginEmail = 'Email is required'
    } else if (!validateEmail(loginForm.email)) {
      newErrors.loginEmail = 'Please enter a valid email'
    }

    if (!loginForm.password) {
      newErrors.loginPassword = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoginLoading(true)
    setErrors({})

    try {
      const success = await onLogin(loginForm.email, loginForm.password)
      if (success) {
        setLoginForm({ email: '', password: '' })
      }
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!signupForm.name.trim()) {
      newErrors.signupName = 'Name is required'
    }

    if (!signupForm.email) {
      newErrors.signupEmail = 'Email is required'
    } else if (!validateEmail(signupForm.email)) {
      newErrors.signupEmail = 'Please enter a valid email'
    }

    if (!signupForm.password) {
      newErrors.signupPassword = 'Password is required'
    } else if (signupForm.password.length < 6) {
      newErrors.signupPassword = 'Password must be at least 6 characters'
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSignupLoading(true)
    setErrors({})

    try {
      const success = await onSignup(signupForm.email, signupForm.password, signupForm.name)
      if (success) {
        setSignupForm({ email: '', password: '', confirmPassword: '', name: '', phone: '' })
      }
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background border-r border-border">
        <div className="w-full max-w-md space-y-8 relative">
          {/* Subtle background decoration */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-muted/30 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-muted/20 rounded-full blur-2xl -z-10" />
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">BlogVerse</span>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">
              {isSignIn ? 'Sign in' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {isSignIn ? (
                <>Don't have an account? <button 
                  type="button" 
                  onClick={() => {
                    setIsSignIn(false)
                    setErrors({})
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Create now
                </button></>
              ) : (
                <>Already have an account? <button 
                  type="button" 
                  onClick={() => {
                    setIsSignIn(true)
                    setErrors({})
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button></>
              )}
            </p>
          </div>

          {/* Sign In Form */}
          {isSignIn && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`h-12 ${errors.loginEmail ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.loginEmail && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.loginEmail}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className={`h-12 ${errors.loginPassword ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.loginPassword && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.loginPassword}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="save-account" className="rounded border-border" />
                    <Label htmlFor="save-account" className="text-sm">Save account</Label>
                  </div>
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={loginLoading}
              >
                {loginLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {!isSignIn && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`h-12 ${errors.signupEmail ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.signupEmail && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.signupEmail}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Full name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`h-12 ${errors.signupName ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.signupName && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.signupName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="flex gap-1">
                    <div className="flex gap-2 items-center px-3 bg-muted border rounded-l-md" style={{ width : '75px'}}>
                      <span className="text-sm text-muted-foreground">🇮🇳</span>
                      <span className="text-sm text-muted-foreground">+91</span>
                    </div>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Phone number"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-12 rounded-l-none border bg-muted border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                    className={`h-12 ${errors.signupPassword ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.signupPassword && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.signupPassword}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`h-12 ${errors.confirmPassword ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.confirmPassword && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={signupLoading}
              >
                {signupLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 flex items-center justify-center gap-3"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
            >
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>
          </div>

          {/* Back Button */}
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Button>
        </div>
      </div>

      {/* Right Panel - Feature Showcase Slider */}
      <div className="hidden lg:flex flex-1 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 bg-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-foreground rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col justify-center p-12 w-full">
          {/* Slider Container */}
          <div className="relative w-full">
            {/* Feature Cards */}
            <div className="space-y-6 mb-12">
              {slides[currentSlide].cards.map((card, index) => {
                const IconComponent = card.icon
                return (
                  <Card key={index} className="bg-background/60 backdrop-blur-md border-border/50 shadow-sm transform transition-all duration-500 ease-in-out">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold">{card.title}</div>
                          <div className="text-sm text-muted-foreground">{card.subtitle}</div>
                        </div>
                        <div className="text-foreground/60">
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{card.details}</span>
                          <span className="text-foreground/70">{card.trend}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${card.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight transition-all duration-500 ease-in-out">
                {slides[currentSlide].title}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg transition-all duration-500 ease-in-out">
                {slides[currentSlide].description}
              </p>
              
              {/* Feature List */}
              <div className="space-y-4 pt-6">
                {slides[currentSlide].features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 transform transition-all duration-500 ease-in-out"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="flex items-center gap-3 pt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                      index === currentSlide 
                        ? 'bg-primary shadow-lg' 
                        : 'bg-primary/40 hover:bg-primary/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}