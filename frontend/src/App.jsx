import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlansPage from './pages/PlansPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import RoutinesPage from './pages/RoutinesPage';
import WorkoutLogsPage from './pages/WorkoutLogsPage';
import ProgressReportPage from './pages/ProgressReportPage';
import RevenueReportPage from './pages/RevenueReportPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] bg-slate-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plans"
              element={
                <ProtectedRoute>
                  <PlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines"
              element={
                <ProtectedRoute>
                  <RoutinesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-logs"
              element={
                <ProtectedRoute>
                  <WorkoutLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RevenueReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}
