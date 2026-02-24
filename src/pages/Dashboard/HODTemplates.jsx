import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getDepartmentTemplates, deleteTemplate } from '../../firebase/firestore'
import { Link } from 'react-router-dom'
import { Plus, LayoutTemplate, Clock, CheckCircle2, XCircle, Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import './Templates.css'

const STATUS_ICON = {
    APPROVED: <CheckCircle2 className="tpl-status--approved" style={{ width: 20, height: 20, flexShrink: 0 }} />,
    PENDING: <Clock className="tpl-status--pending" style={{ width: 20, height: 20, flexShrink: 0 }} />,
    REJECTED: <XCircle className="tpl-status--rejected" style={{ width: 20, height: 20, flexShrink: 0 }} />,
}

const STATUS_BADGE = {
    APPROVED: 'badge badge--success',
    PENDING: 'badge badge--warning',
    REJECTED: 'badge badge--danger',
}

export default function HODTemplates() {
    const { orgId, departmentId } = useAuth()
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orgId || !departmentId) return
        loadTemplates()
    }, [orgId, departmentId])

    const loadTemplates = async () => {
        try {
            const snap = await getDepartmentTemplates(orgId, departmentId)
            setTemplates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        } catch (err) {
            console.error(err); toast.error('Failed to load templates')
        } finally { setLoading(false) }
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
                    <h1 className="db-page-title">Department Templates</h1>
                    <p className="db-page-sub">Manage custom certificate templates. Requires Principal approval.</p>
                </div>
                <Link to="/dashboard/hod/templates/new" className="btn btn--brand btn--sm">
                    <Plus style={{ width: 16, height: 16 }} /> New Template
                </Link>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
            ) : templates.length === 0 ? (
                <div className="db-empty">
                    <LayoutTemplate />
                    <div className="db-empty__title">No Custom Templates</div>
                    <p className="db-empty__sub">You haven't designed any custom certificate templates yet.</p>
                    <Link to="/dashboard/hod/templates/new" className="btn btn--ghost btn--sm" style={{ marginTop: 16 }}>
                        <Plus style={{ width: 16, height: 16 }} /> Build Template
                    </Link>
                </div>
            ) : (
                <div className="tpl-grid">
                    {templates.map((tpl, idx) => (
                        <motion.div
                            key={tpl.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                            className="tpl-card"
                        >
                            <div className="tpl-card__preview">
                                {tpl.backgroundUrl ? (
                                    <img src={tpl.backgroundUrl} alt={tpl.name} />
                                ) : (
                                    <div className="tpl-card__preview-empty">
                                        <LayoutTemplate />
                                        <span>No Preview</span>
                                    </div>
                                )}
                                <div className="tpl-card__hover-overlay">
                                    <Link to={`/dashboard/hod/templates/edit/${tpl.id}`} className="tpl-action-btn" title="Edit"><Edit3 /></Link>
                                    <button onClick={() => handleDelete(tpl.id)} className="tpl-action-btn tpl-action-btn--danger" title="Delete"><Trash2 /></button>
                                </div>
                            </div>
                            <div className="tpl-card__body">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div className="tpl-card__name">{tpl.name}</div>
                                    {STATUS_ICON[tpl.status]}
                                </div>
                                <div className="tpl-card__meta">
                                    Status: <span className={STATUS_BADGE[tpl.status] || 'badge'}>{tpl.status}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
