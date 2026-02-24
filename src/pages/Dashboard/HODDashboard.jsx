import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByDept, getMonthlyUsageByDept, getUsersByDept } from '../../firebase/firestore'
import { FileText, Users, Award, TrendingUp, Search, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import './HODDashboard.css'

const kpiColors = [
    { icon: { bg: 'var(--c-brand-light)', color: 'var(--c-brand)' } },
    { icon: { bg: 'var(--c-success-bg)', color: 'var(--c-success)' } },
    { icon: { bg: '#ecfeff', color: '#0891b2' } },
    { icon: { bg: '#eff6ff', color: '#2563eb' } },
]

export default function HODDashboard() {
    const { orgId, departmentId } = useAuth()
    const [certs, setCerts] = useState([])
    const [monthly, setMonthly] = useState(0)
    const [staffCount, setStaffCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orgId || !departmentId) return
        Promise.all([
            getCertificatesByDept(orgId, departmentId),
            getMonthlyUsageByDept(orgId, departmentId),
            getUsersByDept(orgId, departmentId)
        ]).then(([snap, mon, userSnap]) => {
            setCerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
            setMonthly(mon)
            setStaffCount(userSnap.docs.filter((d) => d.data().status !== 'SUSPENDED').length)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [orgId, departmentId])

    const staffMap = certs.reduce((acc, c) => {
        const s = c.issuedByName || c.issuedBy || 'Unknown'
        acc[s] = (acc[s] || 0) + 1
        return acc
    }, {})

    const stats = [
        { icon: FileText, label: 'Total Certs', value: certs.length },
        { icon: TrendingUp, label: 'This Month', value: monthly },
        { icon: Award, label: 'Valid', value: certs.filter(c => c.status !== 'revoked').length },
        { icon: Users, label: 'Active Staff', value: staffCount },
    ]

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Department Overview</h1>
                    <p className="db-page-sub">Certificates issued in your department.</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="db-kpi-grid">
                {stats.map((s, i) => {
                    const Icon = s.icon
                    const c = kpiColors[i]
                    return (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="db-kpi-card">
                            <div className="db-kpi-card__header">
                                <div className="db-kpi-card__label">{s.label}</div>
                                <div className="db-kpi-card__icon" style={{ background: c.icon.bg }}>
                                    <Icon style={{ color: c.icon.color }} />
                                </div>
                            </div>
                            <div className="db-kpi-card__value">{loading ? '—' : s.value}</div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="hod-dash__qa-grid" style={{ marginBottom: 24 }}>
                <Link to="/dashboard/hod/staff" className="hod-dash__qa-card">
                    <div className="hod-dash__qa-icon" style={{ background: 'var(--c-brand-light)' }}>
                        <UserPlus style={{ color: 'var(--c-brand)' }} />
                    </div>
                    <h3 className="hod-dash__qa-title">Manage Staff</h3>
                    <p className="hod-dash__qa-sub">Invite and view staff members for your department.</p>
                </Link>
                <Link to="/dashboard/hod/certs" className="hod-dash__qa-card">
                    <div className="hod-dash__qa-icon" style={{ background: 'var(--c-success-bg)' }}>
                        <Search style={{ color: 'var(--c-success)' }} />
                    </div>
                    <h3 className="hod-dash__qa-title">Certificates Library</h3>
                    <p className="hod-dash__qa-sub">Search, view, and revoke department certificates.</p>
                </Link>
            </div>

            {/* Staff contribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="hod-dash__staff-card">
                <div className="hod-dash__staff-title">Staff Certificate Contribution</div>
                {Object.keys(staffMap).length === 0
                    ? <p style={{ textAlign: 'center', color: 'var(--c-text-faint)', fontSize: 13, padding: '24px 0' }}>No staff activity yet.</p>
                    : Object.entries(staffMap).map(([name, cnt]) => {
                        const max = Math.max(...Object.values(staffMap))
                        return (
                            <div key={name} className="hod-dash__bar-row">
                                <div className="hod-dash__bar-meta">
                                    <span className="hod-dash__bar-name">{name}</span>
                                    <span className="hod-dash__bar-count">{cnt} certs</span>
                                </div>
                                <div className="hod-dash__bar-track">
                                    <motion.div className="hod-dash__bar-fill" initial={{ width: 0 }} animate={{ width: `${(cnt / max) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                                </div>
                            </div>
                        )
                    })
                }
            </motion.div>

            {/* Recent certs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="hod-dash__recent-card">
                <div className="hod-dash__recent-header">Department Certificates</div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                        <div className="spinner" />
                    </div>
                ) : (
                    <>
                        {certs.slice(0, 8).map((c) => (
                            <div key={c.id} className="hod-dash__cert-row">
                                <div>
                                    <div className="hod-dash__cert-name">{c.recipientName}</div>
                                    <div className="hod-dash__cert-email">{c.recipientEmail}</div>
                                </div>
                                <span className={`badge badge--${c.status === 'revoked' ? 'danger' : 'success'}`}>
                                    {c.status === 'revoked' ? 'Revoked' : 'Valid'}
                                </span>
                            </div>
                        ))}
                        {certs.length === 0 && (
                            <div className="db-empty"><p className="db-empty__sub">No certificates in your department yet.</p></div>
                        )}
                    </>
                )}
            </motion.div>
        </DashboardLayout>
    )
}
