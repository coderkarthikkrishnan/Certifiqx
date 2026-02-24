import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { getDepartmentsByOrg, createDepartment, getUsersByOrg, updateUserProfile } from '../../firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { Building2, Plus, X, Search, BadgeCheck, Users, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const overlayStyle = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }
const modalStyle = { background: 'var(--c-card)', borderRadius: 24, boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, overflow: 'hidden', border: '1px solid var(--c-border)' }

export default function PrincipalDepartments() {
    const { orgId } = useAuth()
    const [departments, setDepartments] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [form, setForm] = useState({ name: '' })
    const [creating, setCreating] = useState(false)
    const [showHODModal, setShowHODModal] = useState(false)
    const [selectedDept, setSelectedDept] = useState(null)
    const [selectedHOD, setSelectedHOD] = useState('')
    const [assigning, setAssigning] = useState(false)

    useEffect(() => { if (!orgId) return; loadData() }, [orgId])

    const loadData = async () => {
        setLoading(true)
        try {
            const [dSnap, uSnap] = await Promise.all([getDepartmentsByOrg(orgId), getUsersByOrg(orgId)])
            setDepartments(dSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
        } catch (err) { console.error(err); toast.error('Failed to load departments') }
        finally { setLoading(false) }
    }

    const filteredDepts = departments.filter(d => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    const availableHODs = users.filter(u => u.role === 'HOD' && u.status === 'ACTIVE')
    const getHODInfo = (deptId) => users.find(u => u.role === 'HOD' && u.departmentId === deptId) || null
    const getStaffCount = (deptId) => users.filter(u => u.role === 'STAFF' && u.departmentId === deptId).length

    const handleCreateDept = async (e) => {
        e.preventDefault(); if (!form.name) return; setCreating(true)
        try { await createDepartment({ name: form.name, orgId }); toast.success('Department created'); setShowCreateModal(false); setForm({ name: '' }); loadData() }
        catch (err) { console.error(err); toast.error('Failed to create department') }
        finally { setCreating(false) }
    }

    const handleAssignHOD = async (e) => {
        e.preventDefault(); if (!selectedDept || !selectedHOD) return; setAssigning(true)
        try {
            const prevHOD = getHODInfo(selectedDept.id)
            if (prevHOD && prevHOD.id !== selectedHOD) await updateUserProfile(prevHOD.id, { departmentId: null })
            await updateUserProfile(selectedHOD, { departmentId: selectedDept.id })
            toast.success('HOD assigned'); setShowHODModal(false); setSelectedDept(null); setSelectedHOD(''); loadData()
        } catch (err) { console.error(err); toast.error('Failed to assign HOD') }
        finally { setAssigning(false) }
    }

    const openAssignModal = (dept) => {
        setSelectedDept(dept); const currentHOD = getHODInfo(dept.id); setSelectedHOD(currentHOD ? currentHOD.id : ''); setShowHODModal(true)
    }

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Departments</h1>
                    <p className="db-page-sub">Manage departments and assign Heads of Departments</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn--brand btn--sm">
                    <Plus style={{ width: 16, height: 16 }} /> New Department
                </button>
            </div>

            <div className="db-table-wrap">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
                ) : filteredDepts.length === 0 ? (
                    <div className="db-empty"><Building2 /><p className="db-empty__sub">No departments found.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead><tr><th>Department</th><th>HOD</th><th style={{ textAlign: 'center' }}>Staff Count</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {filteredDepts.map(dept => {
                                    const hod = getHODInfo(dept.id); const staffCount = getStaffCount(dept.id)
                                    return (
                                        <tr key={dept.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--c-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 style={{ color: 'var(--c-brand)', width: 18, height: 18 }} /></div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--c-text-primary)' }}>{dept.name}</div>
                                                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-faint)' }}>ID: {dept.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {hod ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        {hod.photoURL ? <img src={hod.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#4f46e5' }}>{hod.name?.[0]?.toUpperCase() || 'H'}</div>}
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-secondary)' }}>{hod.name}</div>
                                                            <div style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{hod.email}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--c-text-faint)', fontWeight: 600 }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users style={{ width: 11, height: 11 }} />{staffCount}</span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button onClick={() => openAssignModal(dept)} className="btn btn--ghost btn--xs"><BadgeCheck style={{ width: 13, height: 13 }} /> Assign HOD</button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Dept Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div style={overlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={modalStyle}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-primary)' }}>Create Department</h3>
                                <button onClick={() => setShowCreateModal(false)} className="role-dash__org-btn"><X style={{ width: 16, height: 16 }} /></button>
                            </div>
                            <form onSubmit={handleCreateDept} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="auth-field">
                                    <label className="auth-label">Department Name</label>
                                    <div className="auth-input-wrap">
                                        <span className="auth-input-icon"><Building2 /></span>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" required className="auth-input" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" disabled={creating} className="btn btn--brand" style={{ flex: 1 }}>{creating ? 'Creating…' : 'Create Dept'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign HOD Modal */}
            <AnimatePresence>
                {showHODModal && selectedDept && (
                    <div style={overlayStyle}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={modalStyle}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-primary)' }}>Assign HOD</h3>
                                    <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 }}>{selectedDept.name}</p>
                                </div>
                                <button onClick={() => setShowHODModal(false)} className="role-dash__org-btn"><X style={{ width: 16, height: 16 }} /></button>
                            </div>
                            <form onSubmit={handleAssignHOD} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="auth-field">
                                    <label className="auth-label">Select HOD</label>
                                    {availableHODs.length === 0 ? (
                                        <div style={{ padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>
                                            No active HOD accounts found. Please invite an HOD from the Staff Management page first.
                                        </div>
                                    ) : (
                                        <div className="register-page__select-wrap">
                                            <select value={selectedHOD} onChange={e => setSelectedHOD(e.target.value)} required className="auth-select">
                                                <option value="" disabled>Select a user…</option>
                                                {availableHODs.map(h => <option key={h.id} value={h.id}>{h.name || h.email}{h.departmentId === selectedDept.id ? ' (Current)' : ''}</option>)}
                                            </select>
                                            <span className="register-page__select-icon"><ChevronDown /></span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setShowHODModal(false)} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" disabled={assigning || availableHODs.length === 0} className="btn btn--brand" style={{ flex: 1 }}>{assigning ? 'Assigning…' : 'Confirm Assignment'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    )
}
