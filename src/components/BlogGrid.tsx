import React from 'react'
import { BlogCard } from './BlogCard'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { BookOpen, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

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

interface BlogGridProps {
  blogs: Blog[]
  isLoading?: boolean
  showAuthor?: boolean
  variant?: 'default' | 'compact'
  onBlogClick: (blog: Blog) => void
  onTagClick?: (tag: string) => void
  // Actions
  showActions?: boolean
  onEditBlog?: (blog: Blog) => void
  onDeleteBlog?: (blog: Blog) => void
  // Pagination
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  // Filters
  activeTag?: string
  searchQuery?: string
  onClearFilters?: () => void
  // Empty states
  emptyTitle?: string
  emptyDescription?: string
  showCreateButton?: boolean
  onCreateClick?: () => void
}

export function BlogGrid({
  blogs,
  isLoading = false,
  showAuthor = true,
  variant = 'default',
  onBlogClick,
  onTagClick,
  showActions = false,
  onEditBlog,
  onDeleteBlog,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  activeTag,
  searchQuery,
  onClearFilters,
  emptyTitle = "No blogs found",
  emptyDescription = "There are no blogs to display at the moment.",
  showCreateButton = false,
  onCreateClick
}: BlogGridProps) {

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const EmptyState = () => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {emptyDescription}
        </p>
        
        {/* Active Filters */}
        {(activeTag || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="w-3 h-3" />
                "{searchQuery}"
              </Badge>
            )}
            {activeTag && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                #{activeTag}
              </Badge>
            )}
            {onClearFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        )}

        {showCreateButton && onCreateClick && (
          <Button onClick={onCreateClick}>
            Create Your First Blog
          </Button>
        )}
      </CardContent>
    </Card>
  )

  const Pagination = () => (
    totalPages > 1 && onPageChange && (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (currentPage <= 4) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = currentPage - 3 + i
            }

            if (pageNum < 1 || pageNum > totalPages) return null

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (blogs.length === 0) {
    return (
      <>
        <EmptyState />
        <Pagination />
      </>
    )
  }

  return (
    <>
      <div className={`grid gap-6 ${
        variant === 'compact' 
          ? 'md:grid-cols-2 xl:grid-cols-3' 
          : 'md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onClick={() => onBlogClick(blog)}
            showAuthor={showAuthor}
            variant={variant}
            showActions={showActions}
            onEdit={onEditBlog ? () => onEditBlog(blog) : undefined}
            onDelete={onDeleteBlog ? () => onDeleteBlog(blog) : undefined}
          />
        ))}
      </div>
      
      <Pagination />
    </>
  )
}