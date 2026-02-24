// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute: blocks unauthenticated users.
 * Redirects to /login with the attempted path saved in state.
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingScreen />

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

/**
 * RoleBasedRoute: blocks authenticated users who don't have one of the
 * allowed roles. Redirects to /unauthorized.
 *
 * Usage:
 *   <RoleBasedRoute roles={['PLATFORM_SUPER_ADMIN']}>
 *     <SuperAdminDashboard />
 *   </RoleBasedRoute>
 */
export function RoleBasedRoute({ roles, children }) {
    const { isAuthenticated, role, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingScreen />

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!roles.includes(role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}

// ── Tiny inline loading screen ─────────────────────────────────────────────
function LoadingScreen() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
            <div className="bouncing-loader">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}
