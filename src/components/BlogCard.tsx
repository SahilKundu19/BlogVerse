import React from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Clock, Eye, Calendar, User, MoreVertical, Edit, Trash2 } from 'lucide-react'

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

interface BlogCardProps {
  blog: Blog
  onClick?: () => void
  showAuthor?: boolean
  variant?: 'default' | 'compact'
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function BlogCard({ 
  blog, 
  onClick, 
  showAuthor = true, 
  variant = 'default',
  showActions = false,
  onEdit,
  onDelete
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove markdown formatting for excerpt
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n/g, ' ')
      .trim()

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText
  }

  if (variant === 'compact') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <h3 className="font-medium line-clamp-2">{blog.title}</h3>
                {blog.isDraft && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Draft
                  </Badge>
                )}
              </div>
              
              {showActions && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit()
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete()
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {getExcerpt(blog.content, 100)}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {blog.readingTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(blog.createdAt)}
                </span>
              </div>
              
              {blog.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {blog.views}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold line-clamp-2">{blog.title}</h2>
              {blog.isDraft && (
                <Badge variant="secondary">
                  Draft
                </Badge>
              )}
            </div>

            {showAuthor && blog.author && (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={blog.author.avatar} />
                  <AvatarFallback className="text-xs">
                    {blog.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{blog.author.name}</span>
              </div>
            )}
          </div>
          
          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3">
          {getExcerpt(blog.content)}
        </p>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{blog.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blog.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.createdAt)}
            </span>
          </div>
          
          {blog.views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {blog.views} views
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}