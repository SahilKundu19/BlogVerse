import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Clock, Calendar, Eye, ArrowLeft, Edit, Share, Trash2 } from 'lucide-react'

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

interface BlogViewerProps {
  blog: Blog
  isOwner?: boolean
  onBack: () => void
  onEdit?: () => void
  onShare?: () => void
  onDelete?: () => void
}

export function BlogViewer({ blog, isOwner = false, onBack, onEdit, onShare, onDelete }: BlogViewerProps) {
  const markdownToHtml = (markdown: string) => {
    // Enhanced markdown parser
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-medium mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-medium mt-8 mb-6">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      // Blockquotes
      .replace(/^> (.+)/gm, '<blockquote class="border-l-4 border-muted pl-4 my-4 text-muted-foreground italic">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-8 border-border" />')
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      // Wrap in paragraphs (excluding already formatted elements)
      .replace(/^(?!<[h1-6]|<pre|<ul|<ol|<blockquote|<hr)(.+)/gm, '<p class="mb-4">$1</p>')
      // Lists
      .replace(/^\* (.+)/gm, '<li class="mb-1">$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside my-4 space-y-1">$1</ul>')
      .replace(/^\d+\. (.+)/gm, '<li class="mb-1">$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol class="list-decimal list-inside my-4 space-y-1">$1</ol>')

    return html
  }

  const contentHtml = useMemo(() => markdownToHtml(blog.content), [blog.content])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          {onShare && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShare}
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
          )}
          {isOwner && (
            <>
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Blog Content */}
      <Card>
        <CardHeader className="space-y-6">
          {/* Draft Badge */}
          {blog.isDraft && (
            <div className="flex justify-start">
              <Badge variant="secondary">Draft</Badge>
            </div>
          )}

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {blog.title}
            </h1>
          </div>

          {/* Author and Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {blog.author && (
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={blog.author.avatar} />
                  <AvatarFallback>
                    {blog.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{blog.author.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(blog.createdAt)}
                    </span>
                    {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                      <span className="text-xs">
                        Updated {formatDateTime(blog.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {blog.readingTime} min read
              </span>
              {blog.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {blog.views} views
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </CardHeader>

        <CardContent>
          {/* Blog Content */}
          <div 
            className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-muted prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </CardContent>
      </Card>
    </div>
  )
}