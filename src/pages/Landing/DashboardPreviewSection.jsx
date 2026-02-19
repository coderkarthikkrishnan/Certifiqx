import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const monthlyData = [
    { month: 'Sep', certs: 210 },
    { month: 'Oct', certs: 340 },
    { month: 'Nov', certs: 290 },
    { month: 'Dec', certs: 480 },
    { month: 'Jan', certs: 420 },
    { month: 'Feb', certs: 612 },
]

const deptData = [
    { dept: 'CS', certs: 248 },
    { dept: 'EE', certs: 193 },
    { dept: 'ME', certs: 87 },
    { dept: 'Civil', certs: 64 },
    { dept: 'MBA', certs: 120 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card rounded-xl px-3 py-2 text-xs">
                <div className="font-bold text-gray-800">{label}</div>
                <div className="text-brand-600 font-semibold">{payload[0].value} certs</div>
            </div>
        )
    }
    return null
}

export default function DashboardPreviewSection() {
    return (
        <section id="preview" className="py-28 bg-[#f0f4ff]">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-100 text-brand-600 text-sm font-semibold mb-4 shadow-soft">
                        📊 Live Dashboard Preview
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                        Analytics at a{' '}
                        <span className="gradient-text">glance</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Real-time insights per role — from certificate counts to department breakdowns.
                    </p>
                </motion.div>

                {/* Dashboard frame */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="glass-card rounded-3xl overflow-hidden shadow-card border border-white/80"
                >
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
                                <span className="text-white text-xs font-bold">C</span>
                            </div>
                            <span className="font-bold text-gray-800 text-sm">CertifyPro Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-6 rounded-full bg-gray-100" />
                            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">AS</div>
                        </div>
                    </div>

                    <div className="p-6 grid lg:grid-cols-3 gap-6 bg-white/60">
                        {/* KPI cards */}
                        <div className="space-y-4 lg:col-span-1">
                            {[
                                { label: 'Total Certificates', value: '2,847', delta: '+12%', color: 'from-brand-500 to-brand-700' },
                                { label: 'Active This Month', value: '612', delta: '+46%', color: 'from-accent-500 to-accent-700' },
                                { label: 'Departments', value: '12', delta: 'All Active', color: 'from-cyan-500 to-blue-600' },
                            ].map((k) => (
                                <div key={k.label} className={`rounded-2xl p-4 text-white bg-gradient-to-br ${k.color} shadow-card`}>
                                    <div className="text-xs font-medium text-white/70 mb-1">{k.label}</div>
                                    <div className="text-2xl font-black">{k.value}</div>
                                    <div className="text-xs text-white/80 mt-1 font-semibold">{k.delta} this month</div>
                                </div>
                            ))}
                        </div>

                        {/* Monthly chart */}
                        <div className="soft-card rounded-2xl p-5 lg:col-span-2">
                            <div className="text-sm font-bold text-gray-800 mb-1">Monthly Certificate Generation</div>
                            <div className="text-xs text-gray-400 mb-4">Tracking the last 6 months</div>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={monthlyData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                                    <Bar dataKey="certs" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Dept breakdown */}
                        <div className="soft-card rounded-2xl p-5 lg:col-span-2">
                            <div className="text-sm font-bold text-gray-800 mb-4">Department Breakdown</div>
                            <ResponsiveContainer width="100%" height={140}>
                                <LineChart data={deptData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="certs" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: '#d946ef', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Staff activity */}
                        <div className="soft-card rounded-2xl p-5">
                            <div className="text-sm font-bold text-gray-800 mb-3">Top Staff</div>
                            <div className="space-y-3">
                                {[
                                    { name: 'Dr. Mehta', count: 124, pct: 90 },
                                    { name: 'Prof. Singh', count: 98, pct: 72 },
                                    { name: 'Dr. Patel', count: 76, pct: 55 },
                                ].map((s) => (
                                    <div key={s.name}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-gray-700">{s.name}</span>
                                            <span className="text-gray-400">{s.count} certs</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${s.pct}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
