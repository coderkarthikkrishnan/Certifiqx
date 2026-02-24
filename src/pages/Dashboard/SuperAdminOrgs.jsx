import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { getAllOrganizations, createOrganization, createInvitation, updateOrganization, deleteOrganization } from '../../firebase/firestore'
import { auth } from '../../firebase/firebaseConfig'
import { Building2, Plus, X, Search, CheckCircle, XCircle, Mail, Edit3, Trash2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

function slugify(str) { return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }

const overlayStyle = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }
const modalStyle = { background: 'var(--c-card)', borderRadius: 24, boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 460, overflow: 'hidden', border: '1px solid var(--c-border)' }

const PLAN_CLS = { free: 'badge badge--gray', pro: 'badge badge--brand', enterprise: 'badge badge--accent' }

export default function SuperAdminOrgs() {
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ orgName: '', principalEmail: '' })
    const [creating, setCreating] = useState(false)
    const [editOrg, setEditOrg] = useState(null)
    const [editForm, setEditForm] = useState({ name: '', plan: 'free', monthlyLimit: 200 })
    const [updating, setUpdating] = useState(false)

    useEffect(() => { loadOrgs() }, [])

    const loadOrgs = () => {
        setLoading(true)
        getAllOrganizations().then(snap => { setOrgs(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) }).catch(() => setLoading(false))
    }

    const toggleSuspend = async (org) => {
        try { await updateOrganization(org.id, { suspended: !org.suspended }); setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, suspended: !o.suspended } : o)); toast.success(org.suspended ? 'Organization activated' : 'Organization suspended') }
        catch { toast.error('Failed to update organization') }
    }

    const handleCreateOrg = async (e) => {
        e.preventDefault(); if (!form.orgName || !form.principalEmail) return; setCreating(true)
        try {
            const orgId = slugify(form.orgName) + '-' + Date.now().toString(36)
            await createOrganization(orgId, { name: form.orgName, slug: slugify(form.orgName), plan: 'free', ownerId: 'pending', monthlyLimit: 200, suspended: false })
            await createInvitation(form.principalEmail.toLowerCase(), { role: 'PRINCIPAL', orgId, status: 'pending' })
            auth.currentUser.getIdToken().then(token => fetch('/.netlify/functions/send-invite', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ targetEmail: form.principalEmail.toLowerCase(), role: 'Principal', orgId }) }).catch(e => console.error(e)))
            toast.success('Organization created & Principal account ready!'); setShowModal(false); setForm({ orgName: '', principalEmail: '' }); loadOrgs()
        } catch (err) { console.error(err); toast.error('Failed to create organization') }
        finally { setCreating(false) }
    }

    const handleEditClick = (org) => { setEditOrg(org); setEditForm({ name: org.name, plan: org.plan || 'free', monthlyLimit: org.monthlyLimit || 200 }) }

    const handleUpdateOrg = async (e) => {
        e.preventDefault(); if (!editOrg || !editForm.name) return; setUpdating(true)
        try { await updateOrganization(editOrg.id, { name: editForm.name, plan: editForm.plan, monthlyLimit: Number(editForm.monthlyLimit) }); toast.success('Organization updated'); setEditOrg(null); loadOrgs() }
        catch (err) { console.error(err); toast.error('Failed to update organization') }
        finally { setUpdating(false) }
    }

    const handleDeleteOrg = async (orgId) => {
        if (!window.confirm('Delete this organization? This cannot be undone!')) return
        try { await deleteOrganization(orgId); toast.success('Organization deleted'); setOrgs(prev => prev.filter(o => o.id !== orgId)) }
        catch (err) { console.error(err); toast.error('Failed to delete organization') }
    }

    const filteredOrgs = orgs.filter(o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.slug?.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Organizations</h1>
                    <p className="db-page-sub">Manage platform tenants, plans, and access</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn--brand btn--sm">
                    <Plus style={{ width: 16, height: 16 }} /> New Organization
                </button>
            </div>

            <div className="db-table-wrap">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search organizations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--c-text-faint)', fontWeight: 700 }}>{filteredOrgs.length} total</span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
                ) : filteredOrgs.length === 0 ? (
                    <div className="db-empty"><Building2 /><p className="db-empty__sub">No organizations found.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead><tr><th>Organization Info</th><th>Plan</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {filteredOrgs.map(org => (
                                    <tr key={org.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--c-brand) 0%, var(--c-accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{org.name?.[0]?.toUpperCase() || 'O'}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--c-text-primary)' }}>{org.name}</div>
                                                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-faint)' }}>ID: {org.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={PLAN_CLS[org.plan] || 'badge badge--gray'}>{org.plan || 'free'}</span></td>
                                        <td>
                                            {org.suspended
                                                ? <span className="badge badge--danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle style={{ width: 11, height: 11 }} />Suspended</span>
                                                : <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle style={{ width: 11, height: 11 }} />Active</span>
                                            }
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                <button onClick={() => handleEditClick(org)} className="role-dash__org-btn" title="Edit"><Edit3 style={{ width: 14, height: 14 }} /></button>
                                                <button onClick={() => handleDeleteOrg(org.id)} className="role-dash__org-btn role-dash__org-btn--danger" title="Delete"><Trash2 style={{ width: 14, height: 14 }} /></button>
                                                <button onClick={() => toggleSuspend(org)} className={`btn btn--xs btn--ghost`} style={{ color: org.suspended ? 'var(--c-success)' : 'var(--c-danger)', border: `1px solid ${org.suspended ? 'var(--c-success-border)' : 'var(--c-danger-border)'}` }}>
                                                    {org.suspended ? 'Activate' : 'Suspend'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Org Modal */}
            <AnimatePresence>
                {showModal && (
                    <div style={overlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={modalStyle}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-primary)' }}>Create & Assign Organization</h3>
                                <button onClick={() => setShowModal(false)} className="role-dash__org-btn"><X style={{ width: 16, height: 16 }} /></button>
                            </div>
                            <form onSubmit={handleCreateOrg} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="auth-field">
                                    <label className="auth-label">Organization Name</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Building2 /></span>
                                        <input value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} placeholder="e.g. Acme Institute" required className="auth-input" />
                                    </div>
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">Principal Email</label>
                                    <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 6 }}>An invitation will be linked to this email.</p>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Mail /></span>
                                        <input type="email" value={form.principalEmail} onChange={e => setForm({ ...form, principalEmail: e.target.value })} placeholder="principal@example.com" required className="auth-input" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" disabled={creating} className="btn btn--brand" style={{ flex: 1 }}>{creating ? 'Creating…' : 'Create Org'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editOrg && (
                    <div style={overlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={modalStyle}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-primary)' }}>Edit Organization</h3>
                                <button onClick={() => setEditOrg(null)} className="role-dash__org-btn"><X style={{ width: 16, height: 16 }} /></button>
                            </div>
                            <form onSubmit={handleUpdateOrg} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="auth-field">
                                    <label className="auth-label">Organization Name</label>
                                    <div className="auth-input-wrap">
                                        <input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} required className="auth-input" style={{ paddingLeft: 14 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="auth-field">
                                        <label className="auth-label">Plan</label>
                                        <div className="register-page__select-wrap">
                                            <select value={editForm.plan} onChange={e => setEditForm(prev => ({ ...prev, plan: e.target.value }))} className="auth-select">
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                            <span className="register-page__select-icon"><ChevronDown /></span>
                                        </div>
                                    </div>
                                    <div className="auth-field">
                                        <label className="auth-label">Monthly Limit</label>
                                        <div className="auth-input-wrap">
                                            <input type="number" value={editForm.monthlyLimit} onChange={e => setEditForm(prev => ({ ...prev, monthlyLimit: e.target.value }))} required min="0" className="auth-input" style={{ paddingLeft: 14 }} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setEditOrg(null)} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" disabled={updating} className="btn btn--brand" style={{ flex: 1 }}>{updating ? 'Saving…' : 'Save Changes'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
