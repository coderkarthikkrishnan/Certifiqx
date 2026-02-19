import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signIn, signInWithGoogle } from '../../firebase/auth'
import { getUserProfile } from '../../firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../firebase/firebaseConfig'
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_HOME = {
    superadmin: '/dashboard/super',
    principal: '/dashboard/principal',
    hod: '/dashboard/hod',
    staff: '/dashboard/staff',
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const redirect = async (uid) => {
        const snap = await getUserProfile(uid)
        if (snap.exists()) {
            const { role } = snap.data()
            navigate(ROLE_HOME[role] || '/dashboard')
        } else {
            navigate('/register')
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { user } = await signIn(email, password)
            await redirect(user.uid)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setLoading(true)
        try {
            const { user } = await signInWithGoogle()
            await redirect(user.uid)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-[#f8f9fb]">
            {/* Left panel — illustration */}
            <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-brand-600 to-accent-600 p-16 relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute w-80 h-80 rounded-full bg-white/10 -top-20 -left-20 blur-3xl" />
                <div className="absolute w-60 h-60 rounded-full bg-white/10 bottom-0 right-0 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-9 h-9 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-3">Welcome back</h2>
                    <p className="text-white/70 text-lg mb-10 max-w-sm">
                        Sign in to access your organization's certificate dashboard.
                    </p>

                    {/* Mini mockup */}
                    <div className="glass-card rounded-3xl p-4 text-left max-w-xs mx-auto" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                        <div className="text-[10px] text-white/60 font-semibold mb-2">Today's Summary</div>
                        <div className="space-y-2">
                            {[
                                { label: 'Certificates Generated', value: '48' },
                                { label: 'Emails Delivered', value: '47' },
                                { label: 'QR Scans Today', value: '123' },
                            ].map((s) => (
                                <div key={s.label} className="flex justify-between">
                                    <span className="text-xs text-white/70">{s.label}</span>
                                    <span className="text-xs font-bold text-white">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl gradient-text">CertifyPro</span>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-900 mb-1">Sign in</h1>
                    <p className="text-gray-500 mb-8">Enter your credentials to continue.</p>

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-gray-200 hover:border-brand-300 bg-white transition-all mb-6 text-sm font-semibold text-gray-700 hover:text-brand-600"
                    >
                        <GoogleIcon /> Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or continue with email</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@institution.edu"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-brand-600 text-white font-bold text-sm transition-all btn-glow disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-center text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-600 font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
