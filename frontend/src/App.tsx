import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiagnosePage } from './pages/DiagnosePage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Route Guard for logged in users
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'patient' ? '/dashboard' : '/admin'} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full pb-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Patient Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/diagnose" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DiagnosePage />
              </ProtectedRoute>
            } 
          />

          {/* Shareable History Log */}
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />

          {/* Clinician / Dentist & Admin Dashboard */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'dentist']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Personalized Chatbot for active patients */}
      {isAuthenticated && <ChatbotDrawer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
