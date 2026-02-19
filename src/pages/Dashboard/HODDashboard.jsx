import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByOrg } from '../../firebase/firestore'
import { FileText, Users, Award } from 'lucide-react'

export default function HODDashboard() {
    const { orgId, userProfile } = useAuth()
    const [certs, setCerts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orgId) return
        getCertificatesByOrg(orgId).then((snap) => {
            // HOD sees only certs from their department
            const dept = userProfile?.dept
            const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            setCerts(dept ? all.filter(c => c.dept === dept) : all)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [orgId, userProfile])

    // Staff breakdown
    const staffMap = certs.reduce((acc, c) => {
        const s = c.issuedByName || c.issuedBy || 'Unknown'
        acc[s] = (acc[s] || 0) + 1
        return acc
    }, {})

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">
                    {userProfile?.dept || 'Department'} Overview
                </h1>
                <p className="text-gray-500 text-sm mt-1">Certificates issued in your department.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: FileText, label: 'Total Certs', value: certs.length, color: 'bg-brand-100 text-brand-600' },
                    { icon: Award, label: 'Valid', value: certs.filter(c => c.status !== 'revoked').length, color: 'bg-green-100 text-green-600' },
                    { icon: Users, label: 'Staff Active', value: Object.keys(staffMap).length, color: 'bg-accent-100 text-accent-600' },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="soft-card rounded-3xl p-5"
                    >
                        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-3 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-black text-gray-900">{s.value}</div>
                        <div className="text-sm text-gray-500">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Staff contribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="soft-card rounded-3xl p-6 mb-6"
            >
                <h3 className="font-bold text-gray-800 mb-4">Staff Certificate Contribution</h3>
                <div className="space-y-3">
                    {Object.entries(staffMap).map(([name, cnt]) => {
                        const max = Math.max(...Object.values(staffMap))
                        return (
                            <div key={name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-gray-700">{name}</span>
                                    <span className="text-gray-400 text-xs">{cnt} certs</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cnt / max) * 100}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-500"
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {Object.keys(staffMap).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">No staff activity yet.</p>
                    )}
                </div>
            </motion.div>

            {/* Cert list */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="soft-card rounded-3xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Department Certificates</h3>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {certs.slice(0, 8).map((c) => (
                            <div key={c.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50">
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">{c.recipientName}</div>
                                    <div className="text-xs text-gray-400">{c.recipientEmail}</div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'revoked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                    {c.status === 'revoked' ? 'Revoked' : 'Valid'}
                                </span>
                            </div>
                        ))}
                        {certs.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">No certificates in your department yet.</div>
                        )}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    )
}
