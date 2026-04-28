import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import SystemAdmin from './views/SystemAdmin';
import TechnicalDashboard from './views/TechnicalDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<SystemAdmin />} />
            <Route path="/projects" element={<TechnicalDashboard />} />
            <Route path="/announcements" element={<Dashboard />} />
            <Route path="/create-post" element={<TechnicalDashboard />} />
            <Route path="/meetings" element={<Dashboard />} />
            <Route path="/nda" element={<TechnicalDashboard />} />
            <Route path="/collaborators" element={<Dashboard />} />
            <Route path="/network" element={<TechnicalDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
