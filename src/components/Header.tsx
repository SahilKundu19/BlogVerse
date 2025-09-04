import React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { 
  PenTool, 
  Search, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  BookOpen,
  Home,
  Tag
} from 'lucide-react'

interface User {
  id: string
  name: string
  email?: string
}

interface HeaderProps {
  user: User | null
  isDarkMode: boolean
  onToggleDarkMode: () => void
  onSearch: (query: string) => void
  onTagFilter: (tag: string) => void
  onNavigate: (route: string) => void
  onLogout: () => void
  searchQuery?: string
  popularTags?: Array<{ tag: string; count: number }>
}

export function Header({ 
  user, 
  isDarkMode, 
  onToggleDarkMode, 
  onSearch, 
  onTagFilter,
  onNavigate, 
  onLogout,
  searchQuery = '',
  popularTags = []
}: HeaderProps) {
  const [searchInput, setSearchInput] = React.useState(searchQuery)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchInput)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (!value.trim()) {
      onSearch('')
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">BlogVerse</span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavigate('my-blogs')}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                My Blogs
              </Button>
            )}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:block flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search blogs..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4"
            />
          </form>
        </div>

        {/* Popular Tags - Desktop */}
        {popularTags.length > 0 && (
          <div className="hidden xl:flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {popularTags.slice(0, 3).map(({ tag, count }) => (
                <Badge 
                  key={tag}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80 text-xs"
                  onClick={() => onTagFilter(tag)}
                >
                  #{tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            className="w-9 h-9 p-0"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {user ? (
            <>
              {/* Write Button */}
              <Button
                onClick={() => onNavigate('new-blog')}
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Write
              </Button>

              {/* Mobile Write Button */}
              <Button
                onClick={() => onNavigate('new-blog')}
                size="sm"
                className="sm:hidden w-9 h-9 p-0"
              >
                <PenTool className="w-4 h-4" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onNavigate('profile')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onNavigate('my-blogs')}
                    className="cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Blogs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => onNavigate('auth')} 
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden border-t px-4 py-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search blogs..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </form>

        {/* Mobile Popular Tags */}
        {popularTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {popularTags.slice(0, 5).map(({ tag, count }) => (
              <Badge 
                key={tag}
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80 text-xs"
                onClick={() => onTagFilter(tag)}
              >
                #{tag} ({count})
              </Badge>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}