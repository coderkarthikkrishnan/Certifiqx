import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByStaff, getMonthlyUsageByStaff, getDepartmentById } from '../../firebase/firestore'
import { FileText, TrendingUp, Award, Upload, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import './RoleDash.css'

export default function StaffDashboard() {
    const { orgId, departmentId, currentUser } = useAuth()
    const uid = currentUser?.uid
    const [certs, setCerts] = useState([])
    const [monthly, setMonthly] = useState(0)
    const [department, setDepartment] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orgId || !uid) return
        const fetchAll = async () => {
            try {
                try { const snap = await getCertificatesByStaff(orgId, departmentId, uid); setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))) } catch (e) { console.error(e) }
                try { const mon = await getMonthlyUsageByStaff(orgId, departmentId, uid); setMonthly(mon) } catch (e) { console.error(e) }
                if (departmentId) {
                    try { const d = await getDepartmentById(departmentId); if (d?.exists()) setDepartment({ id: d.id, ...d.data() }) } catch (e) { console.error(e) }
                }
            } finally { setLoading(false) }
        }
        fetchAll()
    }, [orgId, departmentId, uid])

    const stats = [
        { icon: FileText, label: 'Total Certs', value: certs.length },
        { icon: TrendingUp, label: 'This Month', value: monthly },
        { icon: Award, label: 'Valid', value: certs.filter(c => c.status !== 'revoked').length },
    ]

    const ICON_COLORS = [
        { bg: 'var(--c-brand-light)', color: 'var(--c-brand)' },
        { bg: 'var(--c-success-bg)', color: 'var(--c-success)' },
        { bg: '#ecfeff', color: '#0891b2' },
    ]

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Hi, {currentUser?.displayName?.split(' ')[0] || 'Staff'} 👋</h1>
                    <p className="db-page-sub">Manage certificates you have generated for your department.</p>
                </div>
            </div>

            {/* Department banner */}
            {department && (
                <div style={{ background: 'linear-gradient(135deg, var(--c-brand), #1d4ed8)', borderRadius: 24, padding: '28px 32px', color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 style={{ width: 28, height: 28 }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 4 }}>Your Department</div>
                        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em' }}>{department.name}</div>
                        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{department.description || 'You are scoped to this department only.'}</div>
                    </div>
                </div>
            )}

            {/* KPIs */}
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
            <div className="role-dash__qa-grid" style={{ marginBottom: 24 }}>
                <Link to="/dashboard/staff/generate" className="role-dash__qa-card">
                    <div className="role-dash__qa-icon" style={{ background: 'var(--c-brand-light)' }}><Upload style={{ color: 'var(--c-brand)' }} /></div>
                    <div className="role-dash__qa-title">Generate Certificates</div>
                    <div className="role-dash__qa-sub">Upload CSV and issue certificates in bulk.</div>
                </Link>
                <Link to="/dashboard/staff/certs" className="role-dash__qa-card">
                    <div className="role-dash__qa-icon" style={{ background: 'var(--c-success-bg)' }}><FileText style={{ color: 'var(--c-success)' }} /></div>
                    <div className="role-dash__qa-title">My Certificates</div>
                    <div className="role-dash__qa-sub">View and manage certificates you generated.</div>
                </Link>
            </div>

            {/* Recent list */}
            <div className="role-dash__list-card">
                <div className="role-dash__list-header"><span className="role-dash__list-title">Recent Certificates</span></div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><div className="spinner" /></div>
                ) : (
                    <>
                        {certs.slice(0, 6).map(c => (
                            <div key={c.id} className="role-dash__list-row">
                                <div>
                                    <div className="role-dash__row-name">{c.recipientName}</div>
                                    <div className="role-dash__row-sub">{c.recipientEmail}</div>
                                </div>
                                <span className={`badge badge--${c.status === 'revoked' ? 'danger' : 'success'}`}>{c.status === 'revoked' ? 'Revoked' : 'Valid'}</span>
                            </div>
                        ))}
                        {certs.length === 0 && <div className="db-empty"><p className="db-empty__sub">No certificates generated yet.</p></div>}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
