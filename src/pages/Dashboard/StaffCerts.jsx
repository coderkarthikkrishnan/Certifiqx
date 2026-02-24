import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByStaff, revokeCertificate, deleteCertificate } from '../../firebase/firestore'
import { Search, Download, FileText, Ban, Trash2, Mail } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { auth } from '../../firebase/firebaseConfig'

const rowBtn = { borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, fontWeight: 700, background: 'transparent', color: 'var(--c-text-faint)', transition: 'background 0.15s, color 0.15s', cursor: 'pointer', border: 'none', padding: '0 8px', whiteSpace: 'nowrap', height: 'auto', paddingTop: 5, paddingBottom: 5 }

export default function StaffCerts() {
    const { orgId, departmentId, currentUser } = useAuth()
    const uid = currentUser?.uid
    const [certificates, setCertificates] = useState([])
    const [selectedCerts, setSelectedCerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!orgId || !uid) return
        getCertificatesByStaff(orgId, departmentId, uid).then(snap => {
            setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setLoading(false)
        }).catch(err => { console.error(err); toast.error('Failed to load certificates'); setLoading(false) })
    }, [orgId, departmentId, uid])

    const handleRevoke = async (certId) => { if (!window.confirm('Revoke this certificate?')) return; try { await revokeCertificate(certId); setCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'revoked' } : c)); toast.success('Certificate revoked') } catch (err) { console.error(err); toast.error('Failed') } }
    const handleDelete = async (certId) => { if (!window.confirm('Delete this certificate?')) return; try { await deleteCertificate(certId); setCertificates(prev => prev.filter(c => c.id !== certId)); toast.success('Certificate deleted') } catch (err) { console.error(err); toast.error('Failed') } }

    const filteredCerts = certificates.filter(c =>
        (c.recipientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.recipientEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectAll = (e) => e.target.checked ? setSelectedCerts(filteredCerts.map(c => c.id)) : setSelectedCerts([])
    const handleSelect = (certId) => setSelectedCerts(prev => prev.includes(certId) ? prev.filter(id => id !== certId) : [...prev, certId])

    const handleBulkRevoke = async () => {
        if (!window.confirm(`Revoke ${selectedCerts.length} certificates?`)) return
        try { await Promise.all(selectedCerts.map(id => revokeCertificate(id))); setCertificates(prev => prev.map(c => selectedCerts.includes(c.id) ? { ...c, status: 'revoked' } : c)); setSelectedCerts([]); toast.success('Revoked') } catch { toast.error('Failed') }
    }
    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedCerts.length} certificates?`)) return
        try { await Promise.all(selectedCerts.map(id => deleteCertificate(id))); setCertificates(prev => prev.filter(c => !selectedCerts.includes(c.id))); setSelectedCerts([]); toast.success('Deleted') } catch { toast.error('Failed') }
    }
    const handleBulkDownload = async () => {
        const ctsToDownload = certificates.filter(c => selectedCerts.includes(c.id) && c.pdfUrl)
        if (!ctsToDownload.length) return toast.error('No PDFs available')
        const doDownload = async () => {
            const zip = new JSZip(); const folder = zip.folder('Certificates')
            for (const cert of ctsToDownload) { try { const dateStr = (cert.issuedAt?.toDate?.() || new Date()).toISOString().split('T')[0]; folder.file(`${(cert.recipientName || 'User').replace(/[^a-zA-Z0-9]/g, '_')}-${(cert.jobTitle || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}-${dateStr}.pdf`, await (await fetch(cert.pdfUrl)).blob()) } catch { } }
            saveAs(await zip.generateAsync({ type: 'blob' }), 'Certificates.zip')
        }
        toast.promise(doDownload(), { loading: 'Compressing…', success: 'Done!', error: 'Error' }); setSelectedCerts([])
    }

    const dispatchEmails = async (certificateIds) => {
        try {
            const token = await auth.currentUser.getIdToken()
            const res = await fetch('/.netlify/functions/send-certificate-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ certificateIds })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Email dispatch failed')

            if (data.failed === 0) {
                toast.success(`Sent ${data.success} emails successfully!`)
            } else if (data.success > 0) {
                toast.error(`Sent ${data.success} emails, but ${data.failed} failed.`)
            } else {
                toast.error(`Failed to send emails.`)
            }
        } catch (err) {
            console.error(err)
            toast.error(err.message)
        }
    }

    const handleBulkEmail = async () => {
        const ctsToEmail = certificates.filter(c => selectedCerts.includes(c.id) && c.pdfUrl && c.status !== 'revoked')
        if (!ctsToEmail.length) return toast.error('No valid certificates selected')
        if (!window.confirm(`Send emails for ${ctsToEmail.length} certificates?`)) return

        toast.promise(
            dispatchEmails(ctsToEmail.map(c => c.id)),
            { loading: 'Sending emails...', success: 'Dispatch completely!', error: 'Dispatch error' }
        )
        setSelectedCerts([])
    }

    const handleEmail = async (certId) => {
        if (!window.confirm('Send email to this recipient?')) return
        toast.promise(
            dispatchEmails([certId]),
            { loading: 'Sending email...', success: 'Done!', error: 'Error' }
        )
    }

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">My Certificates</h1>
                    <p className="db-page-sub">View all the certificates you have personally generated.</p>
                </div>
            </div>

            <div className="db-table-wrap">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search by recipient, email, ID, or title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                </div>

                {selectedCerts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--c-brand-light)', background: 'var(--c-brand-light)', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-brand)' }}>{selectedCerts.length} selected</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={handleBulkEmail} className="btn btn--ghost btn--xs" style={{ color: 'var(--c-brand)' }}><Mail style={{ width: 13, height: 13 }} /> Email</button>
                            <button onClick={handleBulkDownload} className="btn btn--ghost btn--xs"><Download style={{ width: 13, height: 13 }} /> Download</button>
                            <button onClick={handleBulkRevoke} className="btn btn--ghost btn--xs" style={{ color: '#d97706' }}><Ban style={{ width: 13, height: 13 }} /> Revoke</button>
                            <button onClick={handleBulkDelete} className="btn btn--ghost btn--xs" style={{ color: 'var(--c-danger)' }}><Trash2 style={{ width: 13, height: 13 }} /> Delete</button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
                ) : filteredCerts.length === 0 ? (
                    <div className="db-empty"><FileText /><div className="db-empty__title">No certificates found</div><p className="db-empty__sub">No certificates match your search, or you haven't generated any yet.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 48, textAlign: 'center' }}><input type="checkbox" checked={selectedCerts.length === filteredCerts.length && filteredCerts.length > 0} onChange={handleSelectAll} /></th>
                                    <th>Recipient</th><th>Title</th><th>Date</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
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
                                        <td style={{ fontSize: 13, color: 'var(--c-text-secondary)', fontWeight: 500 }}>{cert.jobTitle || 'Unknown'}</td>
                                        <td style={{ fontSize: 13, color: 'var(--c-text-secondary)' }}>{cert.issuedAt?.toDate?.()?.toLocaleDateString()}</td>
                                        <td><span className={`badge badge--${cert.status === 'revoked' ? 'danger' : 'success'}`}>{cert.status === 'revoked' ? 'Revoked' : 'Valid'}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                                {cert.pdfUrl && (
                                                    <a href={cert.pdfUrl} target="_blank" rel="noreferrer" style={rowBtn} onMouseOver={e => { e.currentTarget.style.background = 'var(--c-brand-light)'; e.currentTarget.style.color = 'var(--c-brand)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-faint)' }} title="Download PDF">
                                                        <Download style={{ width: 14, height: 14 }} /> <span>Download</span>
                                                    </a>
                                                )}
                                                {cert.status !== 'revoked' && <button onClick={() => handleEmail(cert.id)} style={{ ...rowBtn, color: 'var(--c-brand)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--c-brand-light)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} title="Email"><Mail style={{ width: 14, height: 14 }} /><span>Email</span></button>}
                                                {cert.status !== 'revoked' && <button onClick={() => handleRevoke(cert.id)} style={{ ...rowBtn, color: '#d97706' }} onMouseOver={e => e.currentTarget.style.background = '#fff7ed'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} title="Revoke"><Ban style={{ width: 14, height: 14 }} /><span>Revoke</span></button>}
                                                <button onClick={() => handleDelete(cert.id)} style={{ ...rowBtn, color: 'var(--c-danger)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--c-danger-bg)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} title="Delete"><Trash2 style={{ width: 14, height: 14 }} /><span>Delete</span></button>
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
