import React, { useState, useCallback, useMemo, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Eye, Edit, Save, FileText, Tag, Clock, Image, Upload, Search } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

interface MarkdownEditorProps {
  title?: string
  content?: string
  tags?: string[]
  isDraft?: boolean
  onSave?: (data: { title: string; content: string; tags: string[]; isDraft: boolean }) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function MarkdownEditor({ 
  title = '', 
  content = '', 
  tags = [], 
  isDraft = true,
  onSave, 
  onCancel,
  isLoading = false 
}: MarkdownEditorProps) {
  const [blogTitle, setBlogTitle] = useState(title)
  const [blogContent, setBlogContent] = useState(content)
  const [blogTags, setBlogTags] = useState<string[]>(tags)
  const [newTag, setNewTag] = useState('')
  const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit')
  
  // Image upload states
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [isSearchingImages, setIsSearchingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const markdownToHtml = useCallback((markdown: string) => {
    // Simple markdown parser - in a real app you'd use a library like marked or remark
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Images (must come before links)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraphs
      .replace(/^(?!<[h1-6]|<pre|<ul|<ol|<img)(.+)/gm, '<p>$1</p>')
      // Lists
      .replace(/^\* (.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^\d+\. (.+)/gm, '<li>$1</li>')

    return html
  }, [])

  const previewHtml = useMemo(() => markdownToHtml(blogContent), [blogContent, markdownToHtml])

  const readingTime = useMemo(() => {
    const wordsPerMinute = 200
    const words = blogContent.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }, [blogContent])

  const handleAddTag = () => {
    if (newTag.trim() && !blogTags.includes(newTag.trim().toLowerCase())) {
      setBlogTags([...blogTags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setBlogTags(blogTags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async (saveAsDraft: boolean) => {
    if (!blogTitle.trim()) {
      alert('Please enter a title for your blog post')
      return
    }
    
    if (!blogContent.trim()) {
      alert('Please enter some content for your blog post')
      return
    }

    if (onSave) {
      await onSave({
        title: blogTitle.trim(),
        content: blogContent.trim(),
        tags: blogTags,
        isDraft: saveAsDraft
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Image functionality
  const insertImage = (imageUrl: string, altText: string = '') => {
    const imageMarkdown = `![${altText}](${imageUrl})\n\n`
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = blogContent.substring(0, start) + imageMarkdown + blogContent.substring(end)
      setBlogContent(newContent)
      
      // Set cursor position after the inserted image
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length)
      }, 0)
    } else {
      setBlogContent(prev => prev + imageMarkdown)
    }
    setImageDialogOpen(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For demo purposes, we'll create a placeholder URL
      // In a real app, you'd upload to your backend/cloud storage
      const imageUrl = URL.createObjectURL(file)
      insertImage(imageUrl, file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return
    
    setIsSearchingImages(true)
    try {
      // Use Unsplash source URL for reliable image fetching
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(unsplashQuery)}`
      insertImage(imageUrl, unsplashQuery)
    } catch (error) {
      console.error('Failed to search images:', error)
      // Fallback to placeholder
      insertImage(`https://via.placeholder.com/800x400?text=${encodeURIComponent(unsplashQuery)}`, unsplashQuery)
    } finally {
      setIsSearchingImages(false)
      setUnsplashQuery('')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {title ? 'Edit Blog Post' : 'Create New Blog Post'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {readingTime} min read
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              placeholder="Enter your blog title..."
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {blogTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  #{tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleAddTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Editor Tabs */}
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'edit' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4 space-y-4">
              {/* Editor Toolbar */}
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Upload from device */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload from device</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Choose File
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>

                      {/* Search Unsplash */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search stock photos</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search for photos..."
                            value={unsplashQuery}
                            onChange={(e) => setUnsplashQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                searchUnsplash()
                              }
                            }}
                          />
                          <Button
                            onClick={searchUnsplash}
                            disabled={isSearchingImages || !unsplashQuery.trim()}
                            className="flex items-center gap-2"
                          >
                            <Search className="w-4 h-4" />
                            {isSearchingImages ? 'Searching...' : 'Search'}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Find free stock photos to use in your blog
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="text-xs text-muted-foreground">
                  Use Markdown syntax or click the image button to add photos
                </div>
              </div>

              <Textarea
                placeholder="Write your blog content in Markdown...

Example:
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

`Inline code`

```
Code block
```

[Link text](https://example.com)

![Image description](image-url)

* List item 1
* List item 2

1. Numbered item 1
2. Numbered item 2"
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                className="min-h-[400px] font-mono"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{blogTitle || 'Your Blog Title'}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{readingTime} min read</span>
                    {blogTags.length > 0 && (
                      <div className="flex gap-1">
                        {blogTags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-muted-foreground">Start writing to see preview...</p>' }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => handleSave(true)}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isDraft ? 'Publish' : 'Update'}
            </Button>
            {onCancel && (
              <Button 
                onClick={onCancel}
                variant="ghost"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}