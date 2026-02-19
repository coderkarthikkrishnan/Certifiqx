import { motion } from 'framer-motion'
import {
    Building2, Users, FileSpreadsheet, QrCode,
    Trophy, Linkedin, ShieldOff, BarChart3,
} from 'lucide-react'

const features = [
    {
        icon: Building2,
        color: 'bg-brand-100 text-brand-600',
        title: 'Multi-Organization Management',
        desc: 'Manage unlimited organizations from a single Super Admin console. Each org gets isolated data, branding, and subscription limits.',
        mockup: (
            <div className="space-y-2">
                {['Alpha University', 'Tech Institute', 'Global Academy'].map((n, i) => (
                    <div key={n} className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-soft">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                            style={{ background: ['#6366f1', '#d946ef', '#06b6d4'][i] }}>
                            {n[0]}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-gray-800">{n}</div>
                            <div className="text-[10px] text-gray-400">{[342, 128, 89][i]} certs · {['Pro', 'Free', 'Enterprise'][i]}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${['bg-green-100 text-green-700', 'bg-gray-100 text-gray-500', 'bg-brand-100 text-brand-700'][i]}`}>
                            {['Active', 'Free', 'Active'][i]}
                        </span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: Users,
        color: 'bg-accent-100 text-accent-600',
        title: 'Role Hierarchy System',
        desc: 'Four-tier access: Super Admin → Principal → HOD → Staff. Each role sees only their relevant data and controls.',
        mockup: (
            <div className="space-y-2">
                {[
                    { role: 'Super Admin', perms: ['Manage Orgs', 'Global Revoke'], color: 'bg-red-500' },
                    { role: 'Principal', perms: ['Org Analytics', 'All Depts'], color: 'bg-brand-500' },
                    { role: 'HOD', perms: ['Dept Reports', 'Staff Mgmt'], color: 'bg-accent-500' },
                    { role: 'Staff', perms: ['Generate Certs', 'Upload CSV'], color: 'bg-green-500' },
                ].map((r) => (
                    <div key={r.role} className="flex items-center gap-3 p-2.5 rounded-xl bg-white shadow-soft">
                        <div className={`w-2 h-8 rounded-full ${r.color}`} />
                        <div>
                            <div className="text-xs font-bold text-gray-800">{r.role}</div>
                            <div className="text-[10px] text-gray-400">{r.perms.join(' · ')}</div>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: FileSpreadsheet,
        color: 'bg-green-100 text-green-600',
        title: 'Bulk CSV Certificate Generation',
        desc: 'Upload a CSV with names and emails — our system generates, designs, and delivers certificates to every recipient automatically.',
        mockup: (
            <div className="space-y-3">
                <div className="p-3 rounded-xl border-2 border-dashed border-green-200 bg-green-50 text-center">
                    <FileSpreadsheet className="w-8 h-8 text-green-400 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-green-700">students.csv</div>
                    <div className="text-[10px] text-green-500">342 records · Ready</div>
                </div>
                <div className="p-3 rounded-xl bg-white shadow-soft">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>Generating...</span><span>87%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '87%' }} />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">298/342 certificates · Emailing...</div>
                </div>
            </div>
        ),
    },
    {
        icon: QrCode,
        color: 'bg-cyan-100 text-cyan-600',
        title: 'QR-Based Instant Verification',
        desc: 'Every certificate contains a unique QR code. Anyone can scan it to instantly verify authenticity — no login required.',
        mockup: (
            <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-gray-100">
                    <QrCode className="w-16 h-16 text-gray-800" />
                </div>
                <div className="p-3 rounded-xl bg-white shadow-soft w-full text-center">
                    <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        ✓ VERIFIED — Authentic
                    </div>
                    <div className="text-xs font-semibold text-gray-800 mt-2">Arjun Sharma</div>
                    <div className="text-[10px] text-gray-400">Alpha University · 2025</div>
                </div>
            </div>
        ),
    },
    {
        icon: Trophy,
        color: 'bg-yellow-100 text-yellow-600',
        title: 'Public Achievement Page',
        desc: 'Every recipient gets a personalized public achievement page showcasing all their certificates in a beautiful profile layout.',
        mockup: (
            <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white shadow-soft text-center">
                    <div className="w-10 h-10 rounded-full bg-brand-gradient mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm">AS</div>
                    <div className="text-xs font-bold text-gray-800">Arjun Sharma</div>
                    <div className="text-[10px] text-gray-400">certifypro.com/achievement/arjun-sharma</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {['Web Dev', 'Python', 'ML Basics'].slice(0, 2).map(c => (
                        <div key={c} className="p-2 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-100">
                            <div className="w-5 h-5 rounded-md bg-brand-gradient mb-1" />
                            <div className="text-[10px] font-semibold text-gray-700">{c}</div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        icon: Linkedin,
        color: 'bg-blue-100 text-blue-600',
        title: 'LinkedIn Sharing',
        desc: 'Recipients can share their achievement directly to LinkedIn with a pre-filled post, increasing your organization\'s visibility.',
        mockup: (
            <div className="p-3 rounded-xl bg-white shadow-soft space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Linkedin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-800">Share on LinkedIn</div>
                        <div className="text-[10px] text-gray-400">Pre-filled post ready</div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-[10px] text-gray-600 italic leading-relaxed">
                    "Proud to receive my certificate from Alpha University! 🎓 #Achievement"
                </div>
                <button className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Share Now</button>
            </div>
        ),
    },
    {
        icon: ShieldOff,
        color: 'bg-red-100 text-red-500',
        title: 'Certificate Revocation System',
        desc: 'Principals and Super Admins can instantly revoke certificates. The verification page immediately reflects the revoked status.',
        mockup: (
            <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white shadow-soft">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xs font-semibold text-gray-800">CERT-2025-00312</div>
                            <div className="text-[10px] text-gray-400">Rahul Verma · CS Dept</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">REVOKED</span>
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-white shadow-soft">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xs font-semibold text-gray-800">CERT-2025-00298</div>
                            <div className="text-[10px] text-gray-400">Priya Nair · EE Dept</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">VALID</span>
                    </div>
                </div>
            </div>
        ),
    },
]

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function FeaturesSection() {
    return (
        <section id="features" className="py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold mb-4">
                        <BarChart3 className="w-4 h-4" /> Everything You Need
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                        Built for modern{' '}
                        <span className="gradient-text">institutions</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        From ISO-certified universities to bootcamps — CertifyPro scales with you.
                    </p>
                </motion.div>

                {/* Alternating feature rows */}
                <div className="space-y-24">
                    {features.map((f, i) => {
                        const Icon = f.icon
                        const isEven = i % 2 === 0
                        return (
                            <motion.div
                                key={f.title}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-80px' }}
                                className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
                            >
                                {/* Text block */}
                                <div className={isEven ? '' : 'lg:order-2'}>
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${f.color} mb-5`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4">{f.title}</h3>
                                    <p className="text-gray-500 text-lg leading-relaxed">{f.desc}</p>
                                </div>

                                {/* Mockup block */}
                                <div className={`${isEven ? 'lg:order-2' : ''} p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-brand-50/40 border border-gray-100`}>
                                    {f.mockup}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
