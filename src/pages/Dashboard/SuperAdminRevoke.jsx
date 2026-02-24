import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import { getAllCertificates, revokeCertificate } from '../../firebase/firestore'
import { Search, XCircle, FileText, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SuperAdminRevoke() {
    const [certs, setCerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [revoking, setRevoking] = useState(null)

    useEffect(() => {
        getAllCertificates()
            .then(snap => { setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const handleRevoke = async (certId) => {
        if (!confirm('Are you absolutely sure you want to revoke this certificate? This action cannot be undone.')) return
        setRevoking(certId)
        try {
            await revokeCertificate(certId)
            setCerts(prev => prev.map(c => c.id === certId ? { ...c, status: 'revoked' } : c))
            toast.success('Certificate revoked.')
        } catch (err) { console.error(err); toast.error('Failed to revoke certificate.') }
        finally { setRevoking(null) }
    }

    const filteredCerts = certs.filter(c =>
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Certificate Revocation</h1>
                    <p className="db-page-sub">Globally invalidate issued certificates.</p>
                </div>
            </div>

            <div className="db-table-wrap">
                {/* Search header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div className="db-search-wrap" style={{ flex: 1, maxWidth: 400 }}>
                        <span className="db-search-icon"><Search /></span>
                        <input
                            type="text"
                            placeholder="Search by ID, name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="db-search-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--c-text-faint)', fontWeight: 600 }}>{filteredCerts.length} total</span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
                ) : filteredCerts.length === 0 ? (
                    <div className="db-empty"><p className="db-empty__sub">No matching certificates found.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    <th>Certificate ID</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCerts.map((cert) => (
                                    <tr key={cert.id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--c-text-primary)' }}>{cert.recipientName}</div>
                                            <div style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{cert.recipientEmail}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <FileText style={{ width: 14, height: 14, color: 'var(--c-text-faint)' }} />
                                                <code style={{ fontSize: 11, fontWeight: 700, background: 'var(--c-bg)', padding: '2px 6px', borderRadius: 4, color: 'var(--c-text-secondary)' }}>{cert.id}</code>
                                            </div>
                                        </td>
                                        <td>
                                            {cert.status === 'revoked'
                                                ? <span className="badge badge--gray"><XCircle style={{ width: 12, height: 12 }} /> Revoked</span>
                                                : <span className="badge badge--success"><CheckCircle style={{ width: 12, height: 12 }} /> Active</span>
                                            }
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {cert.status !== 'revoked' && (
                                                <button
                                                    onClick={() => handleRevoke(cert.id)}
                                                    disabled={revoking === cert.id}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, background: 'var(--c-danger-bg)', color: 'var(--c-danger)', transition: 'all 0.15s' }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'var(--c-danger)'; e.currentTarget.style.color = '#fff' }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'var(--c-danger-bg)'; e.currentTarget.style.color = 'var(--c-danger)' }}
                                                >
                                                    <AlertTriangle style={{ width: 13, height: 13 }} />
                                                    {revoking === cert.id ? 'Revoking...' : 'Revoke'}
                                                </button>
                                            )}
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
