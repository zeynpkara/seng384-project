import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './views/Landing';
import PlatformHome from './views/PlatformHome';
import MyPostsPage from './views/MyPostsPage';
import DiscoverPage from './views/DiscoverPage';
import SystemAdmin from './views/SystemAdmin';
import Profile from './views/Profile';
import MeetingsPage from './views/MeetingsPage';
import ComingSoon from './views/ComingSoon';
import VerifyEmail from './views/VerifyEmail';

function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
      <p className="text-system-red font-bold text-2xl uppercase tracking-widest">403</p>
      <p className="text-white/50">You don't have permission to access this page.</p>
      <a href="/" className="text-primary underline text-sm">Go home</a>
    </div>
  );
}

interface ProtectedRouteProps {
  element: React.ReactElement;
  roles?: Array<'HEALTHCARE' | 'ENGINEER' | 'ADMIN'>;
}

function ProtectedRoute({ element, roles }: ProtectedRouteProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return element;
}

function WorkspaceRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/my-posts" replace />;
}

function DiscoverRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/discover" replace />;
}

function CreatePostRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'ENGINEER' || user.role === 'HEALTHCARE') {
    return <Navigate to="/my-posts?create=true" replace />;
  }
  return <Navigate to="/admin" replace />;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/home" element={<ProtectedRoute element={<PlatformHome />} roles={['HEALTHCARE', 'ENGINEER']} />} />
        <Route path="/my-posts" element={<ProtectedRoute element={<MyPostsPage />} roles={['HEALTHCARE', 'ENGINEER']} />} />
        <Route path="/discover" element={<ProtectedRoute element={<DiscoverPage />} roles={['HEALTHCARE', 'ENGINEER']} />} />
        <Route path="/admin" element={<ProtectedRoute element={<SystemAdmin />} roles={['ADMIN']} />} />

        {/* Shared authenticated routes */}
        <Route path="/meetings"      element={<ProtectedRoute element={<MeetingsPage />} />} />
        <Route path="/profile"       element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/announcements" element={<ProtectedRoute element={<ComingSoon title="Announcements" description="Platform updates will appear on the new Home experience until the full announcements center is ready." />} />} />
        <Route path="/nda"           element={<ProtectedRoute element={<ComingSoon title="NDA Tracking" description="NDA status is currently surfaced directly inside meetings and profile flows." />} />} />
        <Route path="/collaborators" element={<ProtectedRoute element={<ComingSoon title="Collaborators" description="Direct collaboration management starts after an external meeting is scheduled." />} />} />
        <Route path="/network"       element={<ProtectedRoute element={<ComingSoon title="Network" description="The platform currently focuses on discovery and first contact, not social networking." />} />} />

        {/* Backwards-compatible redirects */}
        <Route path="/dashboard" element={<ProtectedRoute element={<WorkspaceRedirect />} />} />
        <Route path="/projects" element={<ProtectedRoute element={<DiscoverRedirect />} />} />
        <Route path="/create-post" element={<ProtectedRoute element={<CreatePostRedirect />} />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
