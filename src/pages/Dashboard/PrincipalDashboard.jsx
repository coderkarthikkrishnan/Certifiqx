import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByOrg, getMonthlyUsage } from '../../firebase/firestore'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { FileText, Users, TrendingUp, Award, Download } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="soft-card rounded-3xl p-5"
        >
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 font-medium">{label}</div>
            {sub && <div className="text-xs text-green-600 font-semibold mt-1">{sub}</div>}
        </motion.div>
    )
}

export default function PrincipalDashboard() {
    const { orgId, userProfile } = useAuth()
    const [certs, setCerts] = useState([])
    const [monthly, setMonthly] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orgId) return
        Promise.all([
            getCertificatesByOrg(orgId),
            getMonthlyUsage(orgId),
        ]).then(([snap, mon]) => {
            setCerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
            setMonthly(mon)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [orgId])

    // Dept breakdown
    const deptMap = certs.reduce((acc, c) => {
        const d = c.dept || 'General'
        acc[d] = (acc[d] || 0) + 1
        return acc
    }, {})
    const deptData = Object.entries(deptMap).map(([dept, count]) => ({ dept, count }))

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">
                    Welcome, {userProfile?.name?.split(' ')[0] || 'Principal'} 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">Here's your organization's certificate overview.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={FileText} label="Total Certificates" value={certs.length} color="bg-brand-100 text-brand-600" delay={0} />
                <StatCard icon={TrendingUp} label="This Month" value={monthly} sub="↑ Active" color="bg-green-100 text-green-600" delay={0.1} />
                <StatCard icon={Users} label="Departments" value={Object.keys(deptMap).length} color="bg-accent-100 text-accent-600" delay={0.2} />
                <StatCard icon={Award} label="Valid Certificates" value={certs.filter(c => c.status !== 'revoked').length} color="bg-cyan-100 text-cyan-600" delay={0.3} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Dept chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="soft-card rounded-3xl p-6"
                >
                    <h3 className="font-bold text-gray-800 mb-4">Department Breakdown</h3>
                    {deptData.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No certificates yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#pd)" />
                                <defs>
                                    <linearGradient id="pd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Recent certs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="soft-card rounded-3xl p-6"
                >
                    <h3 className="font-bold text-gray-800 mb-4">Recent Certificates</h3>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                        </div>
                    ) : certs.slice(0, 6).map((c) => (
                        <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                            <div>
                                <div className="text-sm font-semibold text-gray-800">{c.recipientName}</div>
                                <div className="text-xs text-gray-400">{c.dept || 'General'} · {c.issuedAt?.toDate?.()?.toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === 'revoked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                    {c.status === 'revoked' ? 'Revoked' : 'Valid'}
                                </span>
                                {c.pdfUrl && (
                                    <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-xl hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors">
                                        <Download className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
