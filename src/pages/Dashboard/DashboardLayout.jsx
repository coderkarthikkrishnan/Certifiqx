import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { signOut } from '../../firebase/auth'
import {
    LayoutDashboard, FileText, Users, LogOut,
    Bell, Search, Menu, ShieldCheck, ChevronRight,
    Building2, BarChart3, Shield, UserCheck, LayoutTemplate,
    Moon, Sun
} from 'lucide-react'
import './DashboardLayout.css'
import UserAvatar from '../../components/UserAvatar'

const roleNavs = {
    PLATFORM_SUPER_ADMIN: [
        { icon: LayoutDashboard, label: 'Overview', path: '/super-admin' },
        { icon: Building2, label: 'Organizations', path: '/super-admin/orgs' },
        { icon: Users, label: 'Users', path: '/super-admin/users' },
        { icon: Shield, label: 'Revocations', path: '/super-admin/revoke' },
    ],
    PRINCIPAL: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/principal' },
        { icon: Building2, label: 'Departments', path: '/dashboard/principal/departments' },
        { icon: Users, label: 'Staff', path: '/dashboard/principal/staff' },
        { icon: LayoutTemplate, label: 'Templates', path: '/dashboard/principal/templates' },
        { icon: FileText, label: 'Certificates', path: '/dashboard/principal/certs' },
    ],
    HOD: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/hod' },
        { icon: Users, label: 'My Staff', path: '/dashboard/hod/staff' },
        { icon: LayoutTemplate, label: 'Templates', path: '/dashboard/hod/templates' },
        { icon: FileText, label: 'Certificates', path: '/dashboard/hod/certs' },
    ],
    STAFF: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/staff' },
        { icon: FileText, label: 'Generate', path: '/dashboard/staff/generate' },
        { icon: BarChart3, label: 'My Certs', path: '/dashboard/staff/certs' },
    ],
}

const roleGradients = {
    PLATFORM_SUPER_ADMIN: 'linear-gradient(135deg,#ef4444,#f97316)',
    PRINCIPAL: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    HOD: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    STAFF: 'linear-gradient(135deg,#16a34a,#15803d)',
}

const roleLabels = {
    PLATFORM_SUPER_ADMIN: 'Super Admin',
    PRINCIPAL: 'Principal',
    HOD: 'Head of Department',
    STAFF: 'Staff',
}

function Sidebar({ role, currentUser, navItems, location, toggleTheme, theme, handleLogout, onNavClick }) {
    const gradient = roleGradients[role] || roleGradients.PRINCIPAL

    return (
        <aside className="dash-sidebar">
            {/* Logo */}
            <Link to="/" className="dash-sidebar__logo">
                <div className="dash-sidebar__logo-icon"><ShieldCheck /></div>
                <span className="dash-sidebar__logo-name">Certifiqx</span>
            </Link>

            {/* Role badge */}
            <div className="dash-sidebar__role-badge" style={{ background: gradient }}>
                <UserCheck />
                {roleLabels[role] || role}
            </div>

            {/* Nav */}
            <nav className="dash-sidebar__nav">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onNavClick}
                            className={`dash-sidebar__nav-item${active ? ' dash-sidebar__nav-item--active' : ''}`}
                        >
                            <Icon />
                            {item.label}
                            {active && <ChevronRight className="nav-chevron" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="dash-sidebar__footer">
                <button onClick={toggleTheme} className="dash-sidebar__theme-btn">
                    {theme === 'dark' ? <><Sun /> Light Mode</> : <><Moon /> Dark Mode</>}
                </button>
                <Link to="/dashboard/profile" className="dash-sidebar__user" onClick={onNavClick}>
                    <UserAvatar
                        photoURL={currentUser?.photoURL}
                        name={currentUser?.displayName || 'User'}
                        size={36}
                        className="dash-sidebar__user-avatar"
                    />
                    <div>
                        <div className="dash-sidebar__user-name">{currentUser?.displayName || 'User'}</div>
                        <div className="dash-sidebar__user-email">{currentUser?.email}</div>
                    </div>
                </Link>
                <button onClick={handleLogout} className="dash-sidebar__logout">
                    <LogOut /> Sign Out
                </button>
            </div>
        </aside>
    )
}

export default function DashboardLayout({ children }) {
    const { currentUser, role } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const navItems = roleNavs[role] || []
    const gradient = roleGradients[role] || roleGradients.PRINCIPAL

    const handleLogout = async () => { await signOut(); navigate('/') }

    const sidebarProps = { role, currentUser, navItems, location, toggleTheme, theme, handleLogout, onNavClick: () => setSidebarOpen(false) }

    return (
        <div className="dash-shell">
            {/* Desktop sidebar */}
            <div className="dash-sidebar-wrap">
                <Sidebar {...sidebarProps} />
            </div>

            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="dash-mobile-overlay"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <motion.div
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="dash-mobile-sidebar-slot"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Sidebar {...sidebarProps} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main */}
            <div className="dash-main">
                {/* Header */}
                <header className="dash-header">
                    <button className="dash-header__menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu />
                    </button>

                    <div className="dash-header__right">
                    </div>
                </header>

                {/* Content */}
                <main className="dash-content">{children}</main>
            </div>
        </div>
    )
}
