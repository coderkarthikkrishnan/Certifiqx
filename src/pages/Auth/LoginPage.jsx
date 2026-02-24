// src/pages/Auth/LoginPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithEmail, signUp, signInWithGoogle } from '../../firebase/auth'
import { ROLES, useAuth } from '../../contexts/AuthContext'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import './LoginPage.css'

const ROLE_REDIRECTS = {
    [ROLES.SUPER_ADMIN]: '/super-admin',
    [ROLES.PRINCIPAL]: '/dashboard',
    [ROLES.HOD]: '/dashboard',
    [ROLES.STAFF]: '/dashboard',
}

const friendlyError = (code) => ({
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already in use.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'no_firestore_doc': 'ACCESS DENIED: Your account has not been set up or you have no pending invitations. Contact your administrator.',
    'invalid_role': 'ACCESS DENIED: Your account role is invalid. Contact your administrator.',
    'org_suspended': 'Your organization has been suspended. Please contact platform support.',
    'firestore_error': 'Failed to fetch account details. Try again.',
}[code] || code || 'Authentication failed. Please try again.')

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || null
    const { currentUser, role, authError } = useAuth()

    const [isClaiming, setIsClaiming] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (currentUser && role) {
            const redirect = from || ROLE_REDIRECTS[role] || '/dashboard'
            navigate(redirect, { replace: true })
        }
    }, [currentUser, role, navigate, from])

    useEffect(() => {
        if (authError) {
            setError(friendlyError(authError))
            setLoading(false)
            setGoogleLoading(false)
        }
    }, [authError])

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) return
        setError('')
        setLoading(true)
        try {
            if (isClaiming) { await signUp(email, password) }
            else { await signInWithEmail(email, password) }
        } catch (err) {
            setError(friendlyError(err.code || err.message))
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError('')
        setGoogleLoading(true)
        try { await signInWithGoogle() }
        catch (err) {
            setError(friendlyError(err.code || err.message))
            setGoogleLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-wrap">
                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-brand"
                >
                    <div className="auth-brand__icon"><ShieldCheck /></div>
                    <span className="auth-brand__name">Certifiqx</span>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="auth-card"
                >
                    <h1 className="auth-card__title">{isClaiming ? 'Setup Account' : 'Welcome back'}</h1>
                    <p className="auth-card__sub">
                        {isClaiming ? 'Set a password to complete your account setup.' : 'Sign in to your organization account.'}
                    </p>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="auth-error"
                            >
                                <AlertCircle />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading || !!currentUser}
                        className="auth-google-btn"
                    >
                        {googleLoading ? (
                            <div className="spinner" />
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="auth-divider">
                        <div className="auth-divider__line" />
                        <span className="auth-divider__text">or continue with email</span>
                        <div className="auth-divider__line" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailSubmit} className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">Work Email</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Mail /></span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@organization.com"
                                    required autoComplete="email"
                                    disabled={loading || googleLoading || !!currentUser}
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">{isClaiming ? 'Create Password' : 'Password'}</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Lock /></span>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isClaiming ? 'At least 6 characters' : '••••••••'}
                                    required
                                    autoComplete={isClaiming ? 'new-password' : 'current-password'}
                                    disabled={loading || googleLoading || !!currentUser}
                                    className="auth-input auth-input--pr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="auth-eye-btn"
                                    disabled={loading || googleLoading || !!currentUser}
                                >
                                    {showPass ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || googleLoading || !!currentUser}
                            className="auth-submit"
                        >
                            {loading ? (
                                <><div className="spinner" /> Please wait…</>
                            ) : (
                                isClaiming ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Foot toggle */}
                <div className="auth-footer">
                    <button
                        onClick={() => { setIsClaiming(!isClaiming); setError('') }}
                        className="auth-footer__link"
                        disabled={loading || googleLoading || !!currentUser}
                    >
                        {isClaiming ? 'Already have an account? Sign In.' : 'First time here? Set up your account.'}
                    </button>
                </div>
            </div>
        </div>
    )
}
