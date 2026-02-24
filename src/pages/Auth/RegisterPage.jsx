import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { signUp } from '../../firebase/auth'
import { createUserProfile, createOrganization } from '../../firebase/firestore'
import { ShieldCheck, Eye, EyeOff, Building2, User, Mail, Lock, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import './RegisterPage.css'
import './LoginPage.css'

const ROLES = [
    { value: 'principal', label: 'Principal', desc: 'Organization head — full org access' },
    { value: 'hod', label: 'HOD', desc: 'Head of Department' },
    { value: 'staff', label: 'Staff', desc: 'Faculty / Certificate issuer' },
]

function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({ orgName: '', name: '', email: '', password: '', role: 'principal', dept: '' })
    const navigate = useNavigate()
    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { user } = await signUp(form.email, form.password)
            const orgId = slugify(form.orgName) + '-' + Date.now().toString(36)
            const orgSlug = slugify(form.orgName)
            if (form.role === 'principal') {
                await createOrganization(orgId, { name: form.orgName, slug: orgSlug, plan: 'free', ownerId: user.uid, monthlyLimit: 200, suspended: false })
            }
            await createUserProfile(user.uid, { uid: user.uid, name: form.name, email: form.email, role: form.role, orgId: form.role === 'principal' ? orgId : null, dept: form.dept || null, photoURL: user.photoURL || null })
            toast.success('Account created! Welcome to Certifiqx 🎉')
            navigate({ principal: '/dashboard/principal', hod: '/dashboard/hod', staff: '/dashboard/staff' }[form.role])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            {/* Left panel */}
            <div className="register-page__left">
                <div className="register-page__left-blob" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="register-page__left-content"
                >
                    <div className="register-page__left-icon"><Building2 /></div>
                    <h2 className="register-page__left-title">Join Certifiqx</h2>
                    <p className="register-page__left-sub">Set up your organization and start issuing digital certificates in minutes.</p>
                    <div className="register-page__left-features">
                        {['✓ Free 200 certs/month', '✓ QR verification included', '✓ No credit card required'].map(t => (
                            <div key={t} className="register-page__left-feature">{t}</div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right form panel */}
            <div className="register-page__right">
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="register-page__form-wrap">
                    <Link to="/" className="register-page__logo">
                        <div className="register-page__logo-icon"><ShieldCheck /></div>
                        <span className="register-page__logo-name gradient-text">Certifiqx</span>
                    </Link>
                    <h1 className="register-page__title">Create account</h1>
                    <p className="register-page__sub">Set up your organization in seconds.</p>

                    <form onSubmit={handleRegister} className="register-page__form">
                        {/* Org name */}
                        <div className="auth-field">
                            <label className="auth-label">Organization Name</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Building2 /></span>
                                <input value={form.orgName} onChange={(e) => set('orgName', e.target.value)} required placeholder="Alpha University" className="auth-input" />
                            </div>
                        </div>
                        {/* Full name */}
                        <div className="auth-field">
                            <label className="auth-label">Your Full Name</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><User /></span>
                                <input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Dr. Arjun Sharma" className="auth-input" />
                            </div>
                        </div>
                        {/* Role */}
                        <div className="auth-field">
                            <label className="auth-label">Your Role</label>
                            <div className="register-page__select-wrap">
                                <select value={form.role} onChange={(e) => set('role', e.target.value)} className="auth-select">
                                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>)}
                                </select>
                                <span className="register-page__select-icon"><ChevronDown /></span>
                            </div>
                        </div>
                        {/* Email */}
                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Mail /></span>
                                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="you@institution.edu" className="auth-input" />
                            </div>
                        </div>
                        {/* Password */}
                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap">
                                <span className="auth-input-icon"><Lock /></span>
                                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} placeholder="Min 8 characters" className="auth-input auth-input--pr" />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="auth-eye-btn">
                                    {showPass ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-submit" style={{ marginTop: 8 }}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="register-page__sign-in">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
