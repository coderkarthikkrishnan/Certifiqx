import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signUp, signInWithGoogle } from '../../firebase/auth'
import { createUserProfile, createOrganization } from '../../firebase/firestore'
import { auth } from '../../firebase/firebaseConfig'
import { ShieldCheck, Eye, EyeOff, Building2, User, Mail, Lock, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
    { value: 'principal', label: 'Principal', desc: 'Organization head — full org access' },
    { value: 'hod', label: 'HOD', desc: 'Head of Department' },
    { value: 'staff', label: 'Staff', desc: 'Faculty / Certificate issuer' },
]

function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function RegisterPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({
        orgName: '', name: '', email: '', password: '',
        role: 'principal', dept: '',
    })
    const navigate = useNavigate()

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { user } = await signUp(form.email, form.password)
            const orgId = slugify(form.orgName) + '-' + Date.now().toString(36)
            const orgSlug = slugify(form.orgName)

            // Create org (if principal) or use existing (hod/staff would join via invite later)
            if (form.role === 'principal') {
                await createOrganization(orgId, {
                    name: form.orgName,
                    slug: orgSlug,
                    plan: 'free',
                    ownerId: user.uid,
                    monthlyLimit: 200,
                    suspended: false,
                })
            }

            // Create user profile
            await createUserProfile(user.uid, {
                uid: user.uid,
                name: form.name,
                email: form.email,
                role: form.role,
                orgId: form.role === 'principal' ? orgId : null,
                dept: form.dept || null,
                photoURL: user.photoURL || null,
            })

            toast.success('Account created! Welcome to CertifyPro 🎉')
            const home = {
                principal: '/dashboard/principal',
                hod: '/dashboard/hod',
                staff: '/dashboard/staff',
            }
            navigate(home[form.role])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-[#f8f9fb]">
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-gradient-to-br from-accent-600 to-brand-600 p-16 relative overflow-hidden">
                <div className="absolute w-80 h-80 rounded-full bg-white/10 -top-20 -right-20 blur-3xl" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-9 h-9 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-3">Join CertifyPro</h2>
                    <p className="text-white/70 text-lg mb-10 max-w-sm">
                        Set up your organization and start issuing digital certificates in minutes.
                    </p>
                    {['✓ Free 200 certs/month', '✓ QR verification included', '✓ No credit card required'].map(t => (
                        <div key={t} className="text-white/80 text-sm font-semibold mb-2">{t}</div>
                    ))}
                </motion.div>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <Link to="/" className="flex items-center gap-2 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl gradient-text">CertifyPro</span>
                    </Link>

                    <h1 className="text-3xl font-black text-gray-900 mb-1">Create account</h1>
                    <p className="text-gray-500 mb-8">Set up your organization in seconds.</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Org name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={form.orgName}
                                    onChange={(e) => set('orgName', e.target.value)}
                                    required
                                    placeholder="Alpha University"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Full name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    required
                                    placeholder="Dr. Arjun Sharma"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Role</label>
                            <div className="relative">
                                <select
                                    value={form.role}
                                    onChange={(e) => set('role', e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all appearance-none"
                                >
                                    {ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => set('email', e.target.value)}
                                    required
                                    placeholder="you@institution.edu"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => set('password', e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="Min 8 characters"
                                    className="w-full pl-10 pr-10 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-brand-600 text-white font-bold text-sm transition-all btn-glow disabled:opacity-60 mt-2"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-center text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
