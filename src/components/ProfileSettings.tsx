import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon, 
  Camera,
  Save,
  AlertCircle,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Instagram,
  Youtube,
  Plus,
  X
} from 'lucide-react'

interface UserProfile {
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
}

interface ProfileSettingsProps {
  user: UserProfile
  onSave: (profileData: Partial<UserProfile>) => Promise<void>
  onBack: () => void
  isLoading?: boolean
}

const socialPlatforms = [
  { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
]

export function ProfileSettings({ user, onSave, onBack, isLoading = false }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    bio: user.bio || '',
    location: user.location || '',
    phone: user.phone || '',
    website: user.website || '',
    avatar: user.avatar || '',
    socialLinks: {
      twitter: user.socialLinks?.twitter || '',
      github: user.socialLinks?.github || '',
      linkedin: user.socialLinks?.linkedin || '',
      instagram: user.socialLinks?.instagram || '',
      youtube: user.socialLinks?.youtube || '',
    },
    preferences: {
      emailNotifications: user.preferences?.emailNotifications ?? true,
      publicProfile: user.preferences?.publicProfile ?? true,
      showEmail: user.preferences?.showEmail ?? false,
      showPhone: user.preferences?.showPhone ?? false,
      showLocation: user.preferences?.showLocation ?? true,
    }
  })

  const [customLinks, setCustomLinks] = useState<Array<{ label: string; url: string }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validatePhone = (phone: string) => {
    // Basic phone validation - allows various formats
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const handlePreferenceChange = (preference: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }))
  }

  const addCustomLink = () => {
    setCustomLinks(prev => [...prev, { label: '', url: '' }])
  }

  const updateCustomLink = (index: number, field: 'label' | 'url', value: string) => {
    setCustomLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
  }

  const removeCustomLink = (index: number) => {
    setCustomLinks(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }

    // Validate social links
    Object.entries(formData.socialLinks).forEach(([platform, url]) => {
      if (url && !validateUrl(url)) {
        newErrors[`social_${platform}`] = `Please enter a valid ${platform} URL`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        socialLinks: Object.fromEntries(
          Object.entries(formData.socialLinks).filter(([_, url]) => url.trim())
        ),
        preferences: formData.preferences
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.avatar} />
                    <AvatarFallback className="text-lg">
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a URL to your profile picture
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <div className="flex items-center text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <div className="flex items-center text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <div className="flex items-center text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className={`pl-10 ${errors.website ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.website && (
                    <div className="flex items-center text-sm text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.website}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User ID</span>
                    <Badge variant="outline" className="font-mono">
                      {user.id}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Member since</span>
                    <span className="text-sm text-muted-foreground">
                      {formatJoinDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Social Media Links
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect your social media profiles to your blog
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </Label>
                    <Input
                      id={key}
                      placeholder={placeholder}
                      value={formData.socialLinks[key as keyof typeof formData.socialLinks] || ''}
                      onChange={(e) => handleSocialLinkChange(key, e.target.value)}
                      className={errors[`social_${key}`] ? 'border-destructive' : ''}
                    />
                    {errors[`social_${key}`] && (
                      <div className="flex items-center text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors[`social_${key}`]}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Custom Links */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custom Links</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add additional links to your profile
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomLink}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Link
                  </Button>
                </div>
              </CardHeader>
              {customLinks.length > 0 && (
                <CardContent className="space-y-4">
                  {customLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Link label"
                        value={link.label}
                        onChange={(e) => updateCustomLink(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) => updateCustomLink(index, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomLink(index)}
                        className="px-3"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control what information is visible to other users
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your profile and blogs
                    </p>
                  </div>
                  <Switch
                    checked={formData.preferences.publicProfile}
                    onCheckedChange={(checked) => handlePreferenceChange('publicProfile', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={formData.preferences.showEmail}
                    onCheckedChange={(checked) => handlePreferenceChange('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your phone number on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={formData.preferences.showPhone}
                    onCheckedChange={(checked) => handlePreferenceChange('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Show Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your location on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={formData.preferences.showLocation}
                    onCheckedChange={(checked) => handlePreferenceChange('showLocation', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage how you receive notifications
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for comments and mentions
                    </p>
                  </div>
                  <Switch
                    checked={formData.preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isSaving || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}