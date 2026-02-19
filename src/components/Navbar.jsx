import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { signOut } from '../firebase/auth'
import { Menu, X, ShieldCheck } from 'lucide-react'

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Dashboard', href: '#preview' },
    { label: 'Pricing', href: '#pricing' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { user, role } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    const roleHome = {
        superadmin: '/dashboard/super',
        principal: '/dashboard/principal',
        hod: '/dashboard/hod',
        staff: '/dashboard/staff',
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-surface-border'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="gradient-text">CertifyPro</span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                        >
                            {l.label}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <button
                                onClick={() => navigate(roleHome[role] || '/dashboard')}
                                className="text-sm font-semibold px-5 py-2 rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-semibold px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-semibold px-5 py-2 rounded-full border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-semibold px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-brand-600 transition-colors btn-glow"
                            >
                                Start Free
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-b border-surface-border px-6 pb-4"
                    >
                        {navLinks.map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                onClick={() => setMobileOpen(false)}
                                className="block py-3 text-sm font-medium text-gray-700 hover:text-brand-600 border-b border-gray-100 last:border-0 transition-colors"
                            >
                                {l.label}
                            </a>
                        ))}
                        <div className="flex gap-3 pt-3">
                            <Link
                                to="/login"
                                className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border border-gray-200 text-gray-700"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full bg-gray-900 text-white"
                            >
                                Start Free
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
