import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { getUsersByOrg, getInvitationsByOrg, createInvitation, deleteInvitation } from '../../firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Mail, Plus, X, Shield, BadgeCheck, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_BADGE = {
    PRINCIPAL: { cls: 'badge badge--brand', icon: Shield, label: 'Principal' },
    HOD: { cls: 'badge badge--accent', icon: BadgeCheck, label: 'HOD' },
    STAFF: { cls: 'badge badge--success', icon: Users, label: 'Staff' },
}

const USER_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#06b6d4', '#0ea5e9', '#f59e0b', '#10b981']

export default function PrincipalStaff() {
    const { orgId, currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [invitations, setInvitations] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ email: '', role: 'STAFF' })
    const [inviting, setInviting] = useState(false)

    useEffect(() => { if (!orgId) return; loadData() }, [orgId])

    const loadData = async () => {
        setLoading(true)
        try {
            const [uSnap, iSnap] = await Promise.all([getUsersByOrg(orgId), getInvitationsByOrg(orgId)])
            setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setInvitations(iSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (err) { console.error(err); toast.error('Failed to load staff list') }
        finally { setLoading(false) }
    }

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!form.email || !form.role) return
        setInviting(true)
        try {
            await createInvitation(form.email.toLowerCase(), { email: form.email.toLowerCase(), role: form.role, orgId, status: 'pending' })
            currentUser.getIdToken().then(token => fetch('/.netlify/functions/send-invite', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetEmail: form.email.toLowerCase(), role: form.role, orgId }) }).catch(e => console.error(e)))
            toast.success(`Invitation created for ${form.email}`)
            setShowModal(false); setForm({ email: '', role: 'STAFF' }); loadData()
        } catch (err) { console.error(err); toast.error('Failed to create invitation') }
        finally { setInviting(false) }
    }

    const handleRevokeInvite = async (email) => {
        if (!window.confirm('Revoke this invitation?')) return
        try { await deleteInvitation(email); toast.success('Invitation revoked'); setInvitations(prev => prev.filter(i => i.id !== email)) }
        catch (err) { console.error(err); toast.error('Failed to revoke invitation') }
    }

    const filteredList = [
        ...users.map(u => ({ ...u, type: 'active' })),
        ...invitations.map(i => ({ ...i, email: i.id, type: 'pending' }))
    ].filter(curr =>
        (curr.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (curr.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const RoleBadge = ({ role }) => {
        const cfg = ROLE_BADGE[role] || { cls: 'badge', icon: Users, label: role }
        const Icon = cfg.icon
        return <span className={cfg.cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon style={{ width: 11, height: 11 }} />{cfg.label}</span>
    }

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Staff Management</h1>
                    <p className="db-page-sub">Manage users and roles in your organization</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn--brand btn--sm">
                    <Plus style={{ width: 16, height: 16 }} /> Invite Staff
                </button>
            </div>

            <div className="db-table-wrap">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
                ) : filteredList.length === 0 ? (
                    <div className="db-empty"><p className="db-empty__sub">No members found.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead><tr><th>Member</th><th>Role</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {filteredList.map((member, i) => (
                                    <tr key={member.id || i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                {member.photoURL
                                                    ? <img src={member.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                                                    : <div style={{ width: 36, height: 36, borderRadius: 10, background: USER_COLORS[i % USER_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{member.name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || 'U'}</div>
                                                }
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--c-text-primary)' }}>{member.name || 'Pending Invite'}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><RoleBadge role={member.role} /></td>
                                        <td>{member.type === 'active' ? <span className="badge badge--success">Active</span> : <span className="badge badge--warning">Pending</span>}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {member.type === 'pending' && (
                                                <button onClick={() => handleRevokeInvite(member.email)} className="role-dash__org-btn role-dash__org-btn--danger" title="Revoke"><Trash2 style={{ width: 13, height: 13 }} /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'var(--c-card)', borderRadius: 24, boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, overflow: 'hidden', border: '1px solid var(--c-border)' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Invite Team Member</h3>
                                <button onClick={() => setShowModal(false)} className="role-dash__org-btn"><X style={{ width: 16, height: 16 }} /></button>
                            </div>
                            <form onSubmit={handleInvite} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="auth-field">
                                    <label className="auth-label">Email Address</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Mail /></span>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="colleague@example.com" required className="auth-input" />
                                    </div>
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Role</label>
                                    <div className="register-page__select-wrap">
                                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="auth-select">
                                            <option value="STAFF">Staff Member</option>
                                            <option value="HOD">Head of Department (HOD)</option>
                                        </select>
                                    </div>
                                    <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4 }}>{form.role === 'STAFF' ? 'Can generate certificates for their assigned department.' : 'Can manage staff and certificates in their department.'}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" disabled={inviting} className="btn btn--brand" style={{ flex: 1 }}>{inviting ? 'Inviting…' : 'Send Invite'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
