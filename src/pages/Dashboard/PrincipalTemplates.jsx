import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getOrgTemplates, updateTemplateStatus, deleteTemplate } from '../../firebase/firestore'
import { Link } from 'react-router-dom'
import { Plus, LayoutTemplate, Clock, CheckCircle2, XCircle, Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import './Templates.css'

const STATUS_ICON = {
    APPROVED: <CheckCircle2 className="tpl-status--approved" style={{ width: 18, height: 18, flexShrink: 0 }} />,
    PENDING: <Clock className="tpl-status--pending" style={{ width: 18, height: 18, flexShrink: 0 }} />,
    REJECTED: <XCircle className="tpl-status--rejected" style={{ width: 18, height: 18, flexShrink: 0 }} />,
}

export default function PrincipalTemplates() {
    const { orgId } = useAuth()
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { if (!orgId) return; loadTemplates() }, [orgId])

    const loadTemplates = async () => {
        try {
            const snap = await getOrgTemplates(orgId)
            setTemplates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (err) { console.error(err); toast.error('Failed to load templates') }
        finally { setLoading(false) }
    }

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateTemplateStatus(id, status)
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, status } : t))
            toast.success(`Template marked as ${status}`)
        } catch (err) { console.error(err); toast.error('Failed to update status') }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return
        try {
            await deleteTemplate(id)
            setTemplates(prev => prev.filter(t => t.id !== id))
            toast.success('Template deleted')
        } catch (err) { console.error(err); toast.error('Failed to delete template') }
    }

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Organization Templates</h1>
                    <p className="db-page-sub">Manage global templates and approve department submissions.</p>
                </div>
                <Link to="/dashboard/principal/templates/new" className="btn btn--brand btn--sm">
                    <Plus style={{ width: 16, height: 16 }} /> New Global Template
                </Link>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
            ) : templates.length === 0 ? (
                <div className="db-empty">
                    <LayoutTemplate />
                    <div className="db-empty__title">No Templates Found</div>
                    <p className="db-empty__sub">No custom templates have been created for this organization yet.</p>
                    <Link to="/dashboard/principal/templates/new" className="btn btn--ghost btn--sm" style={{ marginTop: 16 }}>
                        <Plus style={{ width: 16, height: 16 }} /> Build Global Template
                    </Link>
                </div>
            ) : (
                <div className="tpl-grid">
                    {templates.map((tpl, idx) => (
                        <motion.div key={tpl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="tpl-card">
                            <div className="tpl-card__preview">
                                {tpl.backgroundUrl
                                    ? <img src={tpl.backgroundUrl} alt={tpl.name} />
                                    : <div className="tpl-card__preview-empty"><LayoutTemplate /><span>No Preview</span></div>
                                }
                                <div className="tpl-card__hover-overlay">
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Link to={`/dashboard/principal/templates/edit/${tpl.id}`} className="tpl-action-btn" title="Edit"><Edit3 /></Link>
                                        {tpl.status !== 'APPROVED' && (
                                            <button onClick={() => handleUpdateStatus(tpl.id, 'APPROVED')} className="tpl-action-btn" style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }} title="Approve"><CheckCircle2 /></button>
                                        )}
                                        {tpl.status !== 'REJECTED' && (
                                            <button onClick={() => handleUpdateStatus(tpl.id, 'REJECTED')} className="tpl-action-btn" style={{ background: 'rgba(245,158,11,0.9)', color: '#fff' }} title="Reject"><XCircle /></button>
                                        )}
                                    </div>
                                    <button onClick={() => handleDelete(tpl.id)} className="tpl-action-btn tpl-action-btn--danger" title="Delete"><Trash2 /></button>
                                </div>
                            </div>
                            <div className="tpl-card__body">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div className="tpl-card__name">{tpl.name}</div>
                                    {STATUS_ICON[tpl.status]}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="badge badge--gray">{tpl.role === 'PRINCIPAL' ? 'Global' : 'Department'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
