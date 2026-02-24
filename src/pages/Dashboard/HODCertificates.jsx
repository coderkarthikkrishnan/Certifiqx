import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByDept, revokeCertificate, deleteCertificate } from '../../firebase/firestore'
import { Search, Download, FileText, Ban, Trash2, ShieldOff } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

/* Row action btn style */
const rowActionStyle = { width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'var(--c-text-faint)', transition: 'background 0.15s, color 0.15s' }

export default function HODCertificates() {
    const { orgId, departmentId } = useAuth()
    const [certificates, setCertificates] = useState([])
    const [selectedCerts, setSelectedCerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!orgId || !departmentId) return
        getCertificatesByDept(orgId, departmentId).then(snap => {
            setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setLoading(false)
        }).catch(err => { console.error(err); toast.error('Failed to load certificates'); setLoading(false) })
    }, [orgId, departmentId])

    const handleRevoke = async (certId) => {
        if (!window.confirm('Revoke this certificate? This cannot be undone.')) return
        try { await revokeCertificate(certId); setCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'revoked' } : c)); toast.success('Certificate revoked') }
        catch (err) { console.error(err); toast.error('Failed to revoke certificate') }
    }

    const handleDelete = async (certId) => {
        if (!window.confirm('Permanently delete this certificate record?')) return
        try { await deleteCertificate(certId); setCertificates(prev => prev.filter(c => c.id !== certId)); toast.success('Certificate deleted') }
        catch (err) { console.error(err); toast.error('Failed to delete certificate') }
    }

    const filteredCerts = certificates.filter(c =>
        (c.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.recipientEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.issuedByName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectAll = (e) => e.target.checked ? setSelectedCerts(filteredCerts.map(c => c.id)) : setSelectedCerts([])
    const handleSelect = (certId) => setSelectedCerts(prev => prev.includes(certId) ? prev.filter(id => id !== certId) : [...prev, certId])

    const handleBulkRevoke = async () => {
        if (!window.confirm(`Revoke ${selectedCerts.length} certificates?`)) return
        try { await Promise.all(selectedCerts.map(id => revokeCertificate(id))); setCertificates(prev => prev.map(c => selectedCerts.includes(c.id) ? { ...c, status: 'revoked' } : c)); setSelectedCerts([]); toast.success('Revoked') }
        catch { toast.error('Failed to revoke some') }
    }

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedCerts.length} certificates?`)) return
        try { await Promise.all(selectedCerts.map(id => deleteCertificate(id))); setCertificates(prev => prev.filter(c => !selectedCerts.includes(c.id))); setSelectedCerts([]); toast.success('Deleted') }
        catch { toast.error('Failed to delete some') }
    }

    const handleBulkDownload = async () => {
        const certsToDownload = certificates.filter(c => selectedCerts.includes(c.id) && c.pdfUrl)
        if (!certsToDownload.length) return toast.error('No PDFs available for selection')
        const doDownload = async () => {
            const zip = new JSZip(); const folder = zip.folder('Department_Certificates')
            for (const cert of certsToDownload) {
                try {
                    const blob = await fetch(cert.pdfUrl).then(r => r.blob())
                    const dateStr = (cert.issuedAt?.toDate?.() || new Date()).toISOString().split('T')[0]
                    folder.file(`${(cert.recipientName || 'User').replace(/[^a-zA-Z0-9]/g, '_')}-${dateStr}.pdf`, blob)
                } catch (err) { console.error(err) }
            }
            saveAs(await zip.generateAsync({ type: 'blob' }), 'Department_Certificates.zip')
        }
        toast.promise(doDownload(), { loading: 'Compressing…', success: 'Download complete!', error: 'Error generating ZIP' })
        setSelectedCerts([])
    }

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Department Certificates</h1>
                    <p className="db-page-sub">View and manage all certificates issued by your department.</p>
                </div>
            </div>

            <div className="db-table-wrap">
                {/* Header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search by recipient, email, ID, or issuer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                </div>

                {/* Bulk toolbar */}
                {selectedCerts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--c-brand-light)', background: 'var(--c-brand-light)', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-brand)' }}>{selectedCerts.length} selected</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={handleBulkDownload} className="btn btn--ghost btn--xs"><Download style={{ width: 13, height: 13 }} /> Download</button>
                            <button onClick={handleBulkRevoke} className="btn btn--ghost btn--xs" style={{ color: '#d97706' }}><Ban style={{ width: 13, height: 13 }} /> Revoke</button>
                            <button onClick={handleBulkDelete} className="btn btn--ghost btn--xs" style={{ color: 'var(--c-danger)' }}><Trash2 style={{ width: 13, height: 13 }} /> Delete</button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
                ) : filteredCerts.length === 0 ? (
                    <div className="db-empty"><FileText /><div className="db-empty__title">No certificates found</div><p className="db-empty__sub">No certificates match your search, or none have been issued yet.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 48, textAlign: 'center' }}><input type="checkbox" checked={selectedCerts.length === filteredCerts.length && filteredCerts.length > 0} onChange={handleSelectAll} /></th>
                                    <th>Recipient</th>
                                    <th>Issued By</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCerts.map(cert => (
                                    <tr key={cert.id} style={{ background: selectedCerts.includes(cert.id) ? 'var(--c-brand-light)' : undefined }}>
                                        <td style={{ textAlign: 'center' }}><input type="checkbox" checked={selectedCerts.includes(cert.id)} onChange={() => handleSelect(cert.id)} /></td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--c-text-primary)' }}>{cert.recipientName}</div>
                                            <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{cert.recipientEmail}</div>
                                            <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--c-text-faint)', marginTop: 2 }}>ID: {cert.id}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{cert.issuedByName || 'Unknown'}</div>
                                            <div style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{cert.issuedBy}</div>
                                        </td>
                                        <td style={{ fontSize: 13, color: 'var(--c-text-secondary)' }}>{cert.issuedAt?.toDate?.()?.toLocaleDateString()}</td>
                                        <td><span className={`badge badge--${cert.status === 'revoked' ? 'danger' : 'success'}`}>{cert.status === 'revoked' ? 'Revoked' : 'Valid'}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                                {cert.pdfUrl && <a href={cert.pdfUrl} target="_blank" rel="noreferrer" style={rowActionStyle} title="Download PDF" onMouseOver={e => { e.currentTarget.style.background = 'var(--c-brand-light)'; e.currentTarget.style.color = 'var(--c-brand)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-faint)' }}><Download style={{ width: 14, height: 14 }} /></a>}
                                                {cert.status !== 'revoked' && <button onClick={() => handleRevoke(cert.id)} style={rowActionStyle} title="Revoke" onMouseOver={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#d97706' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-faint)' }}><ShieldOff style={{ width: 14, height: 14 }} /></button>}
                                                <button onClick={() => handleDelete(cert.id)} style={rowActionStyle} title="Delete" onMouseOver={e => { e.currentTarget.style.background = 'var(--c-danger-bg)'; e.currentTarget.style.color = 'var(--c-danger)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-faint)' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
