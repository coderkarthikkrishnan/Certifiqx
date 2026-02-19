import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard'
import PrincipalDashboard from './pages/Dashboard/PrincipalDashboard'
import HODDashboard from './pages/Dashboard/HODDashboard'
import StaffDashboard from './pages/Dashboard/StaffDashboard'
import VerifyPage from './pages/Public/VerifyPage'
import AchievementPage from './pages/Public/AchievementPage'

function DashboardRedirect() {
  const { role } = useAuth()
  const map = {
    superadmin: '/dashboard/super',
    principal: '/dashboard/principal',
    hod: '/dashboard/hod',
    staff: '/dashboard/staff',
  }
  return <Navigate to={map[role] || '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify/:id" element={<VerifyPage />} />
      <Route path="/achievement/:slug" element={<AchievementPage />} />

      {/* Dashboard redirect */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
      } />

      {/* Role dashboards */}
      <Route path="/dashboard/super" element={
        <ProtectedRoute roles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/principal" element={
        <ProtectedRoute roles={['principal']}><PrincipalDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/hod" element={
        <ProtectedRoute roles={['hod']}><HODDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/staff" element={
        <ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e2e',
              color: '#e2e8f0',
              borderRadius: '12px',
              border: '1px solid rgba(99,102,241,0.3)',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
