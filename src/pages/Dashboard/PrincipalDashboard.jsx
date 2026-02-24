import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByOrg, getMonthlyUsage, getUsersByOrg, getDepartmentsByOrg } from '../../firebase/firestore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, Users, TrendingUp, Award, Building2, UserPlus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import './RoleDash.css'

const ICON_COLORS = [
    { bg: 'var(--c-brand-light)', color: 'var(--c-brand)' },
    { bg: 'var(--c-success-bg)', color: 'var(--c-success)' },
    { bg: '#ecfeff', color: '#0891b2' },
    { bg: 'var(--c-accent-light)', color: 'var(--c-accent)' },
]

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: 'var(--c-text-secondary)' }}>{label}</div>
            <div style={{ color: 'var(--c-brand)', fontWeight: 600 }}>{payload[0].value} certs</div>
        </div>
    )
}

export default function PrincipalDashboard() {
    const { orgId, currentUser } = useAuth()
    const [certs, setCerts] = useState([])
    const [monthly, setMonthly] = useState(0)
    const [staffCount, setStaffCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orgId) return
        Promise.all([
            getCertificatesByOrg(orgId), getMonthlyUsage(orgId),
            getUsersByOrg(orgId), getDepartmentsByOrg(orgId)
        ]).then(([snap, mon, userSnap, deptSnap]) => {
            const deptNameMap = {}
            deptSnap.docs.forEach(d => { deptNameMap[d.id] = d.data().name })
            setCerts(snap.docs.map(d => {
                const data = d.data()
                return { id: d.id, ...data, dept: deptNameMap[data.departmentId] || data.dept || 'General' }
            }))
            setMonthly(mon)
            setStaffCount(userSnap.docs.filter(d => {
                const data = d.data()
                return (data.role === 'STAFF' || data.role === 'HOD') && data.status !== 'SUSPENDED'
            }).length)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [orgId])

    const deptData = Object.entries(
        certs.reduce((acc, c) => { const d = c.dept || 'General'; acc[d] = (acc[d] || 0) + 1; return acc }, {})
    ).map(([dept, count]) => ({ dept, count }))

    const stats = [
        { icon: FileText, label: 'Total Certs', value: certs.length },
        { icon: TrendingUp, label: 'This Month', value: monthly },
        { icon: Award, label: 'Valid', value: certs.filter(c => c.status !== 'revoked').length },
        { icon: Users, label: 'Active Staff', value: staffCount },
    ]

    const quickActions = [
        { to: '/dashboard/principal/departments', icon: Building2, bg: 'var(--c-brand-light)', col: 'var(--c-brand)', label: 'Departments', sub: 'Manage departments' },
        { to: '/dashboard/principal/staff', icon: UserPlus, bg: 'var(--c-success-bg)', col: 'var(--c-success)', label: 'Staff', sub: 'Invite or view staff' },
        { to: '/dashboard/principal/certs', icon: Search, bg: 'var(--c-accent-light)', col: 'var(--c-accent)', label: 'Certificates', sub: 'Library & revocations' },
    ]

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Welcome, {currentUser?.displayName?.split(' ')[0] || 'Principal'} 👋</h1>
                    <p className="db-page-sub">Organization analytics at a glance.</p>
                </div>
            </div>

            {/* KPI grid */}
            <div className="db-kpi-grid">
                {stats.map((s, i) => {
                    const Icon = s.icon; const c = ICON_COLORS[i]
                    return (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="db-kpi-card">
                            <div className="db-kpi-card__header">
                                <div className="db-kpi-card__label">{s.label}</div>
                                <div className="db-kpi-card__icon" style={{ background: c.bg }}><Icon style={{ color: c.color }} /></div>
                            </div>
                            <div className="db-kpi-card__value">{loading ? '—' : s.value}</div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Quick actions */}
            <div className="role-dash__qa-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                {quickActions.map((a) => {
                    const Icon = a.icon
                    return (
                        <Link key={a.to} to={a.to} className="role-dash__qa-card">
                            <div className="role-dash__qa-icon" style={{ background: a.bg }}><Icon style={{ color: a.col }} /></div>
                            <div className="role-dash__qa-title">{a.label}</div>
                            <div className="role-dash__qa-sub">{a.sub}</div>
                        </Link>
                    )
                })}
            </div>

            {/* Dept chart */}
            {deptData.length > 0 && (
                <div className="db-chart-card" style={{ marginBottom: 20 }}>
                    <div className="db-chart-card__title">Certificates by Department</div>
                    <div className="db-chart-card__sub">All time</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={deptData} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--c-divider)" vertical={false} />
                            <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'var(--c-text-faint)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--c-text-faint)' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#gradP)" />
                            <defs><linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--c-brand)" /><stop offset="100%" stopColor="var(--c-accent)" /></linearGradient></defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Recent certs */}
            <div className="role-dash__list-card">
                <div className="role-dash__list-header"><span className="role-dash__list-title">Recent Certificates</span></div>
                {certs.slice(0, 6).map(c => (
                    <div key={c.id} className="role-dash__list-row">
                        <div>
                            <div className="role-dash__row-name">{c.recipientName}</div>
                            <div className="role-dash__row-sub">{c.dept}</div>
                        </div>
                        <span className={`badge badge--${c.status === 'revoked' ? 'danger' : 'success'}`}>{c.status === 'revoked' ? 'Revoked' : 'Valid'}</span>
                    </div>
                ))}
                {certs.length === 0 && !loading && <div className="db-empty"><p className="db-empty__sub">No certificates issued yet.</p></div>}
            </div>
        </DashboardLayout>
    )
}
