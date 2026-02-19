import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_HOME = {
    superadmin: '/dashboard/super',
    principal: '/dashboard/principal',
    hod: '/dashboard/hod',
    staff: '/dashboard/staff',
}

/**
 * Wraps a route so only logged-in users with the correct roles can access it.
 * @param {string[]} roles - allowed roles. Empty = any authenticated user.
 */
export default function ProtectedRoute({ children, roles = [] }) {
    const { user, role, loading } = useAuth()

    if (loading) return null

    if (!user) return <Navigate to="/login" replace />

    if (roles.length > 0 && !roles.includes(role)) {
        const home = ROLE_HOME[role] || '/login'
        return <Navigate to={home} replace />
    }

    return children
}
