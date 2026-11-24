import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { MfaLogin } from './pages/MfaLogin';
import { MfaVerify } from './pages/MfaVerify';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { YardList } from './pages/YardList';
import { YardCreate } from './pages/YardCreate';
import { YardDetail } from './pages/YardDetail';
import { VehicleList } from './pages/VehicleList';
import { VehicleCreate } from './pages/VehicleCreate';
import { VehicleDetail } from './pages/VehicleDetail';
import { UsersManagement } from './pages/UsersManagement';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { useAuth } from './context/AuthContext';

const LogoutRedirect: React.FC = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
    localStorage.removeItem('omt_token');
    localStorage.removeItem('omt_user');
    sessionStorage.clear();
    window.location.replace('/mfa/login');
  }, [logout]);
  return null;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes matching OMT Platform */}
          <Route path="/login" element={<Navigate to="/mfa/login" replace />} />
          <Route path="/logout" element={<LogoutRedirect />} />
          <Route path="/profile/logout" element={<LogoutRedirect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mfa/login" element={<MfaLogin />} />
          <Route path="/mfa/verify" element={<MfaVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/mfa/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Yard Routes */}
            <Route path="/yards" element={<YardList />} />
            <Route path="/yards/new" element={<YardCreate />} />
            <Route path="/yards/:id" element={<YardDetail />} />

            {/* Vehicle Routes */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<VehicleCreate />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />

            {/* Tenant Admin Workforce Management */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UsersManagement />
                </ProtectedRoute>
              }
            />

            {/* User Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* 404 Inside Layout */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
