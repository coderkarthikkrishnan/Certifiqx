import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { signOut } from '../firebase/auth'
import { Menu, X, ShieldCheck, Moon, Sun } from 'lucide-react'
import './Navbar.css'

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Preview', href: '#preview' },
    { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { currentUser: user, role } = useAuth()
    const { theme, toggleTheme } = useTheme()
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
            className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
        >
            <div className="navbar__inner">
                {/* Logo */}
                <Link to="/" className="navbar__logo">
                    <div className="navbar__logo-icon">
                        <ShieldCheck />
                    </div>
                    <span className="gradient-text">Certifiqx</span>
                </Link>

                {/* Desktop links */}
                <nav className="navbar__links">
                    {navLinks.map((l) => (
                        <a key={l.label} href={l.href} className="navbar__link">
                            {l.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="navbar__actions">
                    <button onClick={toggleTheme} className="navbar__theme-btn" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun /> : <Moon />}
                    </button>

                    {user ? (
                        <>
                            <button onClick={() => navigate(roleHome[role] || '/dashboard')} className="navbar__btn-signin">
                                Dashboard
                            </button>
                            <button onClick={handleLogout} className="navbar__btn-cta">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar__btn-signin">Sign In</Link>
                            <Link to="/register" className="navbar__btn-cta">Start Free</Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="navbar__mobile"
                    >
                        <button onClick={toggleTheme} className="navbar__mobile-theme">
                            {theme === 'dark' ? <><Sun /> Light Mode</> : <><Moon /> Dark Mode</>}
                        </button>
                        <div className="navbar__mobile-links">
                            {navLinks.map((l) => (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="navbar__mobile-link"
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
                        <div className="navbar__mobile-actions">
                            {!user ? (
                                <>
                                    <Link to="/login" className="navbar__mobile-btn--outline">Sign In</Link>
                                    <Link to="/register" className="navbar__mobile-btn--fill">Start Free</Link>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => navigate(roleHome[role] || '/dashboard')} className="navbar__mobile-btn--outline">Dashboard</button>
                                    <button onClick={handleLogout} className="navbar__mobile-btn--fill">Logout</button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    )
}
