import { Link, useNavigate } from 'react-router-dom'
import { Activity, Bell, LogOut, Moon, Sun, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import useNotificationStore from '@/store/notificationStore'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, clearAuth } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDark((d) => !d)
  }

  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Activity className="h-5 w-5 text-primary" />
          <span>HEALTH<span className="text-primary">AI</span></span>
        </Link>

        {/* Nav links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Discover</Link>
            <Link to="/my-posts" className="hover:text-foreground transition-colors">My Posts</Link>
            <Link to="/meetings" className="hover:text-foreground transition-colors">Meetings</Link>
            {isAdmin() && (
              <Link to="/admin/users" className="hover:text-foreground transition-colors text-primary">Admin</Link>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/notifications"
                className="relative h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
              <Link
                to="/profile"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-sm font-semibold"
              >
                {user?.full_name?.[0]?.toUpperCase() ?? <User className="h-4 w-4" />}
              </Link>
              <button
                onClick={logout}
                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
