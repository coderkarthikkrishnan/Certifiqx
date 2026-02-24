import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getUsersByDept, getInvitationsByDept, createInvitation, deleteInvitation } from '../../firebase/firestore'
import { Search, UserPlus, Users, Trash2, Mail, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAvatar from '../../components/UserAvatar'

/* Inline styles for modal */
const modalStyle = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }
const modalCardStyle = { background: 'var(--c-card)', borderRadius: 24, boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, overflow: 'hidden', border: '1px solid var(--c-border)' }
const modalHeaderStyle = { padding: '20px 24px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg)' }
const modalBodyStyle = { padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }

export default function HODStaff() {
    const { orgId, departmentId, currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [invitations, setInvitations] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteName, setInviteName] = useState('')
    const [inviting, setInviting] = useState(false)

    useEffect(() => {
        if (!orgId || !departmentId) return
        Promise.all([getUsersByDept(orgId, departmentId), getInvitationsByDept(orgId, departmentId)])
            .then(([userSnap, invSnap]) => {
                setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'STAFF'))
                setInvitations(invSnap.docs.map(d => ({ id: d.id, ...d.data() })))
                setLoading(false)
            })
            .catch(err => { console.error(err); toast.error('Failed to load department staff'); setLoading(false) })
    }, [orgId, departmentId])

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!inviteEmail || !inviteName) return toast.error('Please fill all fields')
        setInviting(true)
        try {
            await createInvitation({ email: inviteEmail.toLowerCase(), name: inviteName, role: 'STAFF', orgId, departmentId, invitedBy: currentUser.uid, status: 'pending' })
            currentUser.getIdToken().then(token => {
                fetch('/.netlify/functions/send-invite', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetEmail: inviteEmail.toLowerCase(), role: 'Staff Member', orgId }) })
                    .catch(e => console.error('Email dispatch failed:', e))
            })
            toast.success('Invitation sent successfully')
            setInvitations(prev => [...prev, { id: inviteEmail.toLowerCase(), email: inviteEmail.toLowerCase(), name: inviteName, role: 'STAFF', status: 'pending' }])
            setIsInviteModalOpen(false); setInviteEmail(''); setInviteName('')
        } catch (err) { console.error(err); toast.error(err.message || 'Failed to send invitation') }
        finally { setInviting(false) }
    }

    const handleRevokeInvite = async (email) => {
        if (!window.confirm('Revoke this invitation?')) return
        try { await deleteInvitation(email); toast.success('Invitation revoked'); setInvitations(prev => prev.filter(i => i.id !== email)) }
        catch { toast.error('Failed to revoke invitation') }
    }

    const filteredList = [
        ...users.map(u => ({ ...u, type: 'active' })),
        ...invitations.map(i => ({ ...i, email: i.id, type: 'pending' }))
    ].filter(curr =>
        (curr.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (curr.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Department Staff</h1>
                    <p className="db-page-sub">Manage staff and invitations for your department.</p>
                </div>
                <button onClick={() => setIsInviteModalOpen(true)} className="btn btn--brand btn--sm">
                    <UserPlus style={{ width: 16, height: 16 }} /> Invite Staff
                </button>
            </div>

            {/* Metrics */}
            <div className="db-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 24 }}>
                <div className="db-kpi-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="db-kpi-card__icon" style={{ background: 'var(--c-brand-light)', width: 48, height: 48 }}><Users style={{ color: 'var(--c-brand)', width: 24, height: 24 }} /></div>
                    <div><div className="db-kpi-card__value">{users.length}</div><div className="db-kpi-card__label">Active Staff</div></div>
                </div>
                <div className="db-kpi-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="db-kpi-card__icon" style={{ background: '#fff7ed', width: 48, height: 48 }}><Mail style={{ color: '#d97706', width: 24, height: 24 }} /></div>
                    <div><div className="db-kpi-card__value">{invitations.length}</div><div className="db-kpi-card__label">Pending Invites</div></div>
                </div>
            </div>

            {/* List */}
            <div className="db-table-wrap">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg)' }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
                ) : (
                    <>
                        {filteredList.map(member => (
                            <div key={member.email || member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--c-divider)', transition: 'background 0.15s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'var(--c-bg)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <UserAvatar
                                        photoURL={member.photoURL || null}
                                        name={member.name || member.email}
                                        size={38}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--c-text-primary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            {member.name || 'Invited User'}
                                            {member.type === 'pending' && <span className="badge badge--warning">Pending</span>}
                                            {member.status === 'SUSPENDED' && <span className="badge badge--danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><ShieldAlert style={{ width: 10, height: 10 }} /> Suspended</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{member.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className="badge">STAFF</span>
                                    {member.type === 'pending' && (
                                        <button onClick={() => handleRevokeInvite(member.id)} className="role-dash__org-btn role-dash__org-btn--danger" title="Revoke"><Trash2 style={{ width: 14, height: 14 }} /></button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredList.length === 0 && (
                            <div className="db-empty"><Users /><div className="db-empty__title">No staff found</div><p className="db-empty__sub">Try a different search or invite someone new.</p></div>
                        )}
                    </>
                )}
            </div>

            {/* Invite modal */}
            <AnimatePresence>
                {isInviteModalOpen && (
                    <div style={modalStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={modalCardStyle}>
                            <div style={modalHeaderStyle}>
                                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text-primary)' }}>Invite Staff Member</h2>
                                <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 3 }}>They will be assigned exclusively to your department.</p>
                            </div>
                            <form onSubmit={handleInvite} style={modalBodyStyle}>
                                <div className="auth-field">
                                    <label className="auth-label">Full Name</label>
                                    <div className="auth-input-wrap"><input value={inviteName} onChange={(e) => setInviteName(e.target.value)} required placeholder="John Doe" className="auth-input" style={{ paddingLeft: 14 }} /></div>
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Email Address</label>
                                    <div className="auth-input-wrap"><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="john@example.com" className="auth-input" style={{ paddingLeft: 14 }} /></div>
                                </div>
                                <div style={{ background: 'var(--c-brand-light)', color: 'var(--c-brand)', padding: '12px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
                                    This user will automatically be assigned the <strong>STAFF</strong> role for your department.
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setIsInviteModalOpen(false)} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" disabled={inviting} className="btn btn--brand" style={{ flex: 1 }}>
                                        {inviting ? <><div className="bouncing-loader"><div></div><div></div><div></div></div> Inviting…</> : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
