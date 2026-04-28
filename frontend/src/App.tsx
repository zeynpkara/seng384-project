import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import SystemAdmin from './views/SystemAdmin';
import TechnicalDashboard from './views/TechnicalDashboard';
import Profile from './views/Profile';

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
  role?: 'HEALTHCARE' | 'ENGINEER' | 'ADMIN';
}

function ProtectedRoute({ element, role }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} role="HEALTHCARE" />} />
        <Route path="/admin" element={<ProtectedRoute element={<SystemAdmin />} role="ADMIN" />} />
        <Route path="/projects" element={<ProtectedRoute element={<TechnicalDashboard />} role="ENGINEER" />} />
        <Route path="/announcements" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/create-post" element={<ProtectedRoute element={<TechnicalDashboard />} />} />
        <Route path="/meetings" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/nda" element={<ProtectedRoute element={<TechnicalDashboard />} />} />
        <Route path="/collaborators" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/network" element={<ProtectedRoute element={<TechnicalDashboard />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
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
