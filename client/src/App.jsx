import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MatchResults from './pages/MatchResults';
import ApplicationDetail from './pages/ApplicationDetail';
import AssistedMode from './pages/AssistedMode';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/match" element={
            <ProtectedRoute allowedRoles={['applicant', 'vle', 'ngo_worker', 'admin']}>
              <MatchResults />
            </ProtectedRoute>
          } />
          
          <Route path="/applications/:id" element={
            <ProtectedRoute>
              <ApplicationDetail />
            </ProtectedRoute>
          } />

          <Route path="/application/:id" element={
            <ProtectedRoute>
              <ApplicationDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/assisted" element={
            <ProtectedRoute allowedRoles={['vle', 'ngo_worker', 'admin']}>
              <AssistedMode />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
