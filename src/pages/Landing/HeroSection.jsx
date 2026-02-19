import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Shield, Zap, Globe } from 'lucide-react'

/* ── Floating blob ────────────────────────────────────────────────────── */
function Blob({ className, delay = 0 }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`}
            animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
    )
}

/* ── Floating dashboard mockup card ──────────────────────────────────── */
function DashboardMockup() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative w-full max-w-lg mx-auto"
        >
            {/* Outer glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-accent-400/20 rounded-3xl blur-2xl" />

            {/* Main card */}
            <div className="relative glass-card rounded-3xl p-5 shadow-card">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-gray-200" />
                        <div className="w-8 h-2 rounded-full bg-brand-200" />
                    </div>
                </div>

                {/* Stat row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                        { label: 'Certificates', value: '2,847', color: 'bg-brand-100 text-brand-700' },
                        { label: 'This Month', value: '342', color: 'bg-green-100 text-green-700' },
                        { label: 'Departments', value: '12', color: 'bg-accent-100 text-accent-700' },
                    ].map((s) => (
                        <div key={s.label} className="soft-card rounded-2xl p-3">
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-1 ${s.color}`}>{s.label}</div>
                            <div className="text-xl font-bold text-gray-900">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Chart bar mockup */}
                <div className="soft-card rounded-2xl p-3 mb-3">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Monthly Generation</div>
                    <div className="flex items-end gap-1.5 h-14">
                        {[40, 65, 50, 80, 60, 90, 75, 85, 70, 95, 60, 100].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 rounded-t-md"
                                style={{
                                    height: `${h}%`,
                                    background: i === 11
                                        ? 'linear-gradient(to top, #6366f1, #d946ef)'
                                        : 'rgba(99,102,241,0.15)',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent certs list */}
                <div className="space-y-2">
                    {[
                        { name: 'Arjun Sharma', dept: 'Computer Science', badge: 'Valid' },
                        { name: 'Priya Nair', dept: 'Electronics', badge: 'Valid' },
                    ].map((c) => (
                        <div key={c.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                            <div>
                                <div className="text-xs font-semibold text-gray-800">{c.name}</div>
                                <div className="text-[10px] text-gray-400">{c.dept}</div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{c.badge}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating badges */}
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 glass-card rounded-2xl px-3 py-2 shadow-card flex items-center gap-2"
            >
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-green-600" />
                </div>
                <div>
                    <div className="text-[9px] font-medium text-gray-500">QR Verified</div>
                    <div className="text-xs font-bold text-green-600">Authentic</div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-3 py-2 shadow-card flex items-center gap-2"
            >
                <div className="w-6 h-6 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-brand-600" />
                </div>
                <div>
                    <div className="text-[9px] font-medium text-gray-500">Bulk Generated</div>
                    <div className="text-xs font-bold text-brand-600">342 in 4s</div>
                </div>
            </motion.div>
        </motion.div>
    )
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-hero-gradient">
            {/* Background blobs */}
            <Blob className="w-[500px] h-[500px] bg-brand-400 -top-40 -left-40" delay={0} />
            <Blob className="w-[400px] h-[400px] bg-accent-400 top-20 right-0" delay={2} />
            <Blob className="w-[300px] h-[300px] bg-brand-300 bottom-0 left-1/3" delay={4} />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left: Text */}
                <div>
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-semibold mb-6"
                    >
                        <Globe className="w-4 h-4" />
                        Multi-Organization Certificate Platform
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl lg:text-6xl font-black text-gray-900 leading-[1.08] mb-6"
                    >
                        Secure Digital{' '}
                        <span className="gradient-pill gradient-text">Certificates</span>{' '}
                        with Instant{' '}
                        <span className="gradient-text">Verification</span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg"
                    >
                        Generate bulk certificates from CSV, embed QR codes for instant verification,
                        and manage your entire organization's credentialing — all in one premium platform.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-brand-600 transition-all btn-glow shadow-lg group"
                        >
                            Start Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-gray-200 text-gray-700 text-sm font-bold hover:border-brand-300 hover:text-brand-600 transition-all group">
                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                                <Play className="w-3 h-3 text-brand-600 ml-0.5" />
                            </div>
                            Book Demo
                        </button>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-6 mt-10"
                    >
                        {[
                            { value: '50K+', label: 'Certificates' },
                            { value: '200+', label: 'Organizations' },
                            { value: '99.9%', label: 'Uptime' },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-xl font-black gradient-text">{s.value}</div>
                                <div className="text-xs text-gray-400 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right: Mockup */}
                <div className="hidden lg:block">
                    <DashboardMockup />
                </div>
            </div>
        </section>
    )
}
