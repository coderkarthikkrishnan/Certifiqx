import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { getAllOrganizations } from '../../firebase/firestore'
import { Building2, Users, FileText, TrendingUp, ShieldOff, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateOrganization } from '../../firebase/firestore'

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
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
            <div className="text-sm text-gray-500 font-medium mt-0.5">{label}</div>
        </motion.div>
    )
}

export default function SuperAdminDashboard() {
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllOrganizations().then((snap) => {
            setOrgs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const toggleSuspend = async (org) => {
        try {
            await updateOrganization(org.id, { suspended: !org.suspended })
            setOrgs((prev) => prev.map((o) => o.id === org.id ? { ...o, suspended: !o.suspended } : o))
            toast.success(org.suspended ? 'Organization activated' : 'Organization suspended')
        } catch {
            toast.error('Failed to update organization')
        }
    }

    const planBadge = (plan) => ({
        free: 'bg-gray-100 text-gray-600',
        pro: 'bg-brand-100 text-brand-700',
        enterprise: 'bg-accent-100 text-accent-700',
    })[plan] || 'bg-gray-100 text-gray-600'

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">Platform Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Global analytics across all organizations</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Building2} label="Total Orgs" value={orgs.length} color="bg-brand-100 text-brand-600" delay={0} />
                <StatCard icon={Users} label="Active Orgs" value={orgs.filter(o => !o.suspended).length} color="bg-green-100 text-green-600" delay={0.1} />
                <StatCard icon={FileText} label="Pro / Enterprise" value={orgs.filter(o => o.plan !== 'free').length} color="bg-accent-100 text-accent-600" delay={0.2} />
                <StatCard icon={ShieldOff} label="Suspended" value={orgs.filter(o => o.suspended).length} color="bg-red-100 text-red-500" delay={0.3} />
            </div>

            {/* Organizations table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="soft-card rounded-3xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">All Organizations</h2>
                    <span className="text-xs text-gray-400 font-medium">{orgs.length} total</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    </div>
                ) : orgs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">No organizations registered yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                    <th className="px-6 py-3 text-left">Organization</th>
                                    <th className="px-6 py-3 text-left">Plan</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Registered</th>
                                    <th className="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orgs.map((org) => (
                                    <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                                                    {org.name?.[0]?.toUpperCase() || 'O'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-800">{org.name}</div>
                                                    <div className="text-xs text-gray-400">{org.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${planBadge(org.plan)}`}>
                                                {org.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {org.suspended ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                                                    <XCircle className="w-3 h-3" /> Suspended
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {org.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleSuspend(org)}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${org.suspended
                                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                            >
                                                {org.suspended ? 'Activate' : 'Suspend'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    )
}
