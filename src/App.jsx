// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, ROLES, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute'

// Pages
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import UnauthorizedPage from './pages/Auth/UnauthorizedPage'
import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard'
import SuperAdminOrgs from './pages/Dashboard/SuperAdminOrgs'
import SuperAdminUsers from './pages/Dashboard/SuperAdminUsers'
import SuperAdminRevoke from './pages/Dashboard/SuperAdminRevoke'
import PrincipalDashboard from './pages/Dashboard/PrincipalDashboard'
import PrincipalDepartments from './pages/Dashboard/PrincipalDepartments'
import PrincipalStaff from './pages/Dashboard/PrincipalStaff'
import PrincipalCertificates from './pages/Dashboard/PrincipalCertificates'
import HODDashboard from './pages/Dashboard/HODDashboard'
import HODStaff from './pages/Dashboard/HODStaff'
import HODCertificates from './pages/Dashboard/HODCertificates'
import StaffDashboard from './pages/Dashboard/StaffDashboard'
import StaffGenerate from './pages/Dashboard/StaffGenerate'
import StaffCerts from './pages/Dashboard/StaffCerts'
import TemplateBuilder from './pages/Dashboard/TemplateBuilder'
import PrincipalTemplates from './pages/Dashboard/PrincipalTemplates'
import HODTemplates from './pages/Dashboard/HODTemplates'
import ProfilePage from './pages/Dashboard/ProfilePage'
import VerifyPage from './pages/Public/VerifyPage'
import AchievementPage from './pages/Public/AchievementPage'

const DASHBOARD_ROLES = [ROLES.PRINCIPAL, ROLES.HOD, ROLES.STAFF]

/**
 * /dashboard — smart redirect based on authenticated user's role.
 */
function DashboardRedirect() {
  const { role, isHOD, isPrincipal, isStaff, isSuperAdmin } = useAuth()
  if (isSuperAdmin) return <Navigate to="/super-admin" replace />
  if (isPrincipal) return <Navigate to="/dashboard/principal" replace />
  if (isHOD) return <Navigate to="/dashboard/hod" replace />
  if (isStaff) return <Navigate to="/dashboard/staff" replace />
  return <Navigate to="/unauthorized" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/verify/:id" element={<VerifyPage />} />
      <Route path="/achievement/:slug" element={<AchievementPage />} />

      {/* ── Smart dashboard redirect ────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* ── Super Admin ─────────────────────────────────────────────── */}
      <Route
        path="/super-admin"
        element={
          <RoleBasedRoute roles={[ROLES.SUPER_ADMIN]}>
            <SuperAdminDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/super-admin/orgs"
        element={
          <RoleBasedRoute roles={[ROLES.SUPER_ADMIN]}>
            <SuperAdminOrgs />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/super-admin/users"
        element={
          <RoleBasedRoute roles={[ROLES.SUPER_ADMIN]}>
            <SuperAdminUsers />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/super-admin/revoke"
        element={
          <RoleBasedRoute roles={[ROLES.SUPER_ADMIN]}>
            <SuperAdminRevoke />
          </RoleBasedRoute>
        }
      />

      {/* ── Principal ───────────────────────────────────────────────── */}
      <Route
        path="/dashboard/principal"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <PrincipalDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/principal/departments"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <PrincipalDepartments />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/principal/staff"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <PrincipalStaff />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/principal/certs"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <PrincipalCertificates />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/principal/templates"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <PrincipalTemplates />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/principal/templates/new"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <TemplateBuilder />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/principal/templates/edit/:templateId"
        element={
          <RoleBasedRoute roles={[ROLES.PRINCIPAL]}>
            <TemplateBuilder />
          </RoleBasedRoute>
        }
      />

      {/* ── HOD ─────────────────────────────────────────────────────── */}
      <Route
        path="/dashboard/hod"
        element={
          <RoleBasedRoute roles={[ROLES.HOD]}>
            <HODDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/hod/staff"
        element={
          <RoleBasedRoute roles={[ROLES.HOD]}>
            <HODStaff />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/hod/certs"
        element={
          <RoleBasedRoute roles={[ROLES.HOD]}>
            <HODCertificates />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/hod/templates"
        element={
          <RoleBasedRoute roles={[ROLES.HOD]}>
            <HODTemplates />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/hod/templates/new"
        element={
          <RoleBasedRoute roles={[ROLES.HOD]}>
            <TemplateBuilder />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/hod/templates/edit/:templateId"
        element={
          <RoleBasedRoute roles={[ROLES.HOD]}>
            <TemplateBuilder />
          </RoleBasedRoute>
        }
      />

      {/* ── Staff ───────────────────────────────────────────────────── */}
      <Route
        path="/dashboard/staff"
        element={
          <RoleBasedRoute roles={[ROLES.STAFF]}>
            <StaffDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/staff/generate"
        element={
          <RoleBasedRoute roles={[ROLES.STAFF]}>
            <StaffGenerate />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/dashboard/staff/certs"
        element={
          <RoleBasedRoute roles={[ROLES.STAFF]}>
            <StaffCerts />
          </RoleBasedRoute>
        }
      />

      {/* ── Catch-all ───────────────────────────────────────────────── */}
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white dark:border dark:border-slate-700',
              style: {
                borderRadius: '12px',
                background: '#ffffff',
                color: '#1e293b',
              }
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
