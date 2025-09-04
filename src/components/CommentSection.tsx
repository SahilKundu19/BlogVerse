import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Separator } from './ui/separator'
import { MessageCircle, Send } from 'lucide-react'

interface Comment {
  id: string
  blogId: string
  content: string
  authorId: string
  createdAt: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
}

interface CommentSectionProps {
  blogId: string
  comments: Comment[]
  currentUser?: {
    id: string
    name: string
  } | null
  onAddComment: (content: string) => Promise<void>
  isLoading?: boolean
}

export function CommentSection({ 
  blogId, 
  comments, 
  currentUser, 
  onAddComment, 
  isLoading = false 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !currentUser) {
      return
    }

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {currentUser ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="sm"
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                Please sign in to leave a comment
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            <Separator />
            {comments.map((comment, index) => (
              <div key={comment.id}>
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={comment.author?.avatar} />
                    <AvatarFallback className="text-xs">
                      {comment.author?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.author?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                </div>
                
                {index < comments.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        ) : (
          currentUser && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}