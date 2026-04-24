import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from '@/router'
import { Suspense, lazy } from 'react'

const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const CreatePost = lazy(() => import('@/pages/posts/CreatePost'))
const PostDetail = lazy(() => import('@/pages/posts/PostDetail'))
const MyPosts = lazy(() => import('@/pages/posts/MyPosts'))
const Meetings = lazy(() => import('@/pages/meetings/Meetings'))
const Profile = lazy(() => import('@/pages/profile/Profile'))
const Notifications = lazy(() => import('@/pages/notifications/Notifications'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'))
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/posts/new" element={<CreatePost />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Admin only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
