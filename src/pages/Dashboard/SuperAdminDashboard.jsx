import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { getAllOrganizations, updateOrganization } from '../../firebase/firestore'
import { Building2, Users, FileText, ShieldOff, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import './RoleDash.css'

const kpiColors = [
    { bg: 'var(--c-brand-light)', color: 'var(--c-brand)' },
    { bg: 'var(--c-success-bg)', color: 'var(--c-success)' },
    { bg: 'var(--c-accent-light)', color: 'var(--c-accent)' },
    { bg: 'var(--c-danger-bg)', color: 'var(--c-danger)' },
]

const planStyle = {
    free: { background: 'var(--c-divider)', color: 'var(--c-text-muted)' },
    pro: { background: 'var(--c-brand-light)', color: 'var(--c-brand)' },
    enterprise: { background: 'var(--c-accent-light)', color: 'var(--c-accent)' },
}

const ORG_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#06b6d4', '#0ea5e9', '#f59e0b', '#10b981']

export default function SuperAdminDashboard() {
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllOrganizations().then(snap => { setOrgs(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const toggleSuspend = async (org) => {
        try {
            await updateOrganization(org.id, { suspended: !org.suspended })
            setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, suspended: !o.suspended } : o))
            toast.success(org.suspended ? 'Organization activated' : 'Organization suspended')
        } catch { toast.error('Failed to update organization') }
    }

    const stats = [
        { icon: Building2, label: 'Total Orgs', value: orgs.length },
        { icon: Users, label: 'Active Orgs', value: orgs.filter(o => !o.suspended).length },
        { icon: FileText, label: 'Pro / Enterprise', value: orgs.filter(o => o.plan !== 'free').length },
        { icon: ShieldOff, label: 'Suspended', value: orgs.filter(o => o.suspended).length },
    ]

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Platform Overview</h1>
                    <p className="db-page-sub">Global analytics across all organizations</p>
                </div>
                <Link to="/super-admin/orgs" className="btn btn--brand btn--sm">+ New Org</Link>
            </div>

            {/* KPIs */}
            <div className="db-kpi-grid">
                {stats.map((s, i) => {
                    const Icon = s.icon; const c = kpiColors[i]
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
            <div className="role-dash__qa-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
                {[
                    { to: '/super-admin/orgs', icon: Building2, bg: 'var(--c-brand-light)', col: 'var(--c-brand)', label: 'Manage Organizations', sub: 'View, suspend, or create new orgs.' },
                    { to: '/super-admin/users', icon: Users, bg: 'var(--c-brand-light)', col: 'var(--c-brand)', label: 'User Directory', sub: 'Search and view cross-platform users.' },
                    { to: '/super-admin/revoke', icon: ShieldOff, bg: 'var(--c-danger-bg)', col: 'var(--c-danger)', label: 'Revoke Certificates', sub: 'Globally search and revoke credentials.' },
                ].map(a => {
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

            {/* Org cards */}
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text-secondary)', marginBottom: 14 }}>All Organizations</div>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
            ) : (
                <div className="role-dash__org-grid">
                    {orgs.map((org, i) => {
                        const avatarColor = ORG_COLORS[i % ORG_COLORS.length]
                        const ps = planStyle[org.plan] || planStyle.free
                        return (
                            <div key={org.id} className="role-dash__org-card">
                                <div className="role-dash__org-header">
                                    <div className="role-dash__org-avatar" style={{ background: avatarColor }}>{org.name?.[0] || 'O'}</div>
                                    <div>
                                        <div className="role-dash__org-name">{org.name}</div>
                                        <div className="role-dash__org-plan" style={ps}>{org.plan}</div>
                                    </div>
                                    {org.suspended
                                        ? <span className="badge badge--danger" style={{ marginLeft: 'auto' }}>Suspended</span>
                                        : <span className="badge badge--success" style={{ marginLeft: 'auto' }}>Active</span>
                                    }
                                </div>
                                <div className="role-dash__org-footer">
                                    <span className="role-dash__org-stat">Limit: {org.monthlyLimit ?? '—'}/mo</span>
                                    <div className="role-dash__org-actions">
                                        <button onClick={() => toggleSuspend(org)} className={`role-dash__org-btn${org.suspended ? '' : ' role-dash__org-btn--danger'}`} title={org.suspended ? 'Activate' : 'Suspend'}>
                                            {org.suspended ? <CheckCircle /> : <XCircle />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
