import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../firebase/auth'
import {
    LayoutDashboard, FileText, Users, Settings, LogOut,
    Bell, Search, Menu, X, ShieldCheck, ChevronRight,
    Building2, BarChart3, Shield, UserCheck,
} from 'lucide-react'

const roleNavs = {
    superadmin: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/super' },
        { icon: Building2, label: 'Organizations', path: '/dashboard/super/orgs' },
        { icon: BarChart3, label: 'Analytics', path: '/dashboard/super/analytics' },
        { icon: Shield, label: 'Revocations', path: '/dashboard/super/revoke' },
    ],
    principal: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/principal' },
        { icon: Users, label: 'Staff', path: '/dashboard/principal/staff' },
        { icon: FileText, label: 'Certificates', path: '/dashboard/principal/certs' },
        { icon: Settings, label: 'Settings', path: '/dashboard/principal/settings' },
    ],
    hod: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/hod' },
        { icon: Users, label: 'My Staff', path: '/dashboard/hod/staff' },
        { icon: FileText, label: 'Certificates', path: '/dashboard/hod/certs' },
    ],
    staff: [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/staff' },
        { icon: FileText, label: 'Generate', path: '/dashboard/staff/generate' },
        { icon: BarChart3, label: 'My Certs', path: '/dashboard/staff/certs' },
    ],
}

const roleColors = {
    superadmin: 'from-red-500 to-orange-500',
    principal: 'from-brand-500 to-brand-700',
    hod: 'from-accent-500 to-accent-700',
    staff: 'from-green-500 to-emerald-600',
}

const roleLabels = {
    superadmin: 'Super Admin',
    principal: 'Principal',
    hod: 'Head of Department',
    staff: 'Staff',
}

export default function DashboardLayout({ children }) {
    const { user, userProfile, role } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const navItems = roleNavs[role] || []
    const avatar = userProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    const Sidebar = () => (
        <aside className="flex flex-col h-full w-64 bg-white rounded-3xl p-4 shadow-card border border-surface-border">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 px-2 mb-8 pt-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-lg gradient-text">CertifyPro</span>
            </Link>

            {/* Role badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r ${roleColors[role] || 'from-brand-500 to-brand-700'} text-white text-xs font-bold mb-6`}>
                <UserCheck className="w-3.5 h-3.5" />
                {roleLabels[role] || role}
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${active
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {item.label}
                            {active && <ChevronRight className="ml-auto w-3.5 h-3.5 text-brand-400" />}
                        </Link>
                    )
                })}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center gap-3 px-2 mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white text-sm font-bold`}>
                        {avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-800 truncate">{userProfile?.name || 'User'}</div>
                        <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </aside>
    )

    return (
        <div className="min-h-screen bg-[#f0f4ff] flex">
            {/* Desktop sidebar */}
            <div className="hidden lg:block p-4 pr-0 sticky top-0 h-screen">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <motion.div
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="absolute left-0 top-0 bottom-0 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Sidebar />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top navbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#f0f4ff]">
                    <button
                        className="lg:hidden p-2 rounded-xl bg-white shadow-soft"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Search */}
                    <div className="hidden md:flex items-center gap-3 flex-1 max-w-sm mx-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                placeholder="Search certificates..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-surface-border text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <button className="relative p-2.5 rounded-2xl bg-white shadow-soft hover:bg-brand-50 transition-colors">
                            <Bell className="w-4 h-4 text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500" />
                        </button>
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white text-sm font-bold shadow-soft`}>
                            {avatar}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 pt-2 lg:p-8 lg:pt-2">
                    {children}
                </main>
            </div>
        </div>
    )
}
