import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldOff, Download, ArrowLeft, Calendar, Building2, QrCode } from 'lucide-react'
import './VerifyPage.css'

export default function VerifyPage() {
    const { id } = useParams()
    const [cert, setCert] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`/.netlify/functions/get-certificate?id=${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) setError(data.error)
                else setCert(data)
                setLoading(false)
            })
            .catch(() => { setError('Network error'); setLoading(false) })
    }, [id])

    if (loading) {
        return (
            <div className="verify-page__loading">
                <div className="bouncing-loader">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        )
    }

    const isValid = cert && cert.status !== 'revoked'

    return (
        <div className="verify-page">
            <Link to="/" className="verify-back-link">
                <ArrowLeft />
                Back to Certifiqx
            </Link>

            {error ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="verify-card"
                >
                    <div className="verify-notfound">
                        <div className="verify-notfound__icon">
                            <ShieldOff />
                        </div>
                        <h1 className="verify-notfound__title">Certificate Not Found</h1>
                        <p className="verify-notfound__sub">
                            The certificate ID <code>{id}</code> does not exist or has been deleted.
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="verify-card"
                >
                    {/* Status banner */}
                    <div className={`verify-banner ${isValid ? 'verify-banner--valid' : 'verify-banner--revoked'}`}>
                        {isValid ? <ShieldCheck /> : <ShieldOff />}
                        <div>
                            <div className="verify-banner__label">Certificate Status</div>
                            <div className="verify-banner__status">
                                {isValid ? '✓ VALID' : '✗ REVOKED'}
                            </div>
                        </div>
                    </div>

                    {/* Certificate body */}
                    <div className="verify-body">
                        <div className="verify-recipient">
                            <div className="verify-recipient__name">{cert.recipientName}</div>
                            <div className="verify-recipient__label">has been awarded the certificate of</div>
                            <div className="verify-recipient__title">{cert.jobTitle}</div>
                        </div>

                        <div className="verify-details">
                            <div className="verify-detail-row">
                                <Building2 />
                                <div>
                                    <div className="verify-detail-row__label">Organization</div>
                                    <div className="verify-detail-row__value">{cert.orgName}</div>
                                </div>
                            </div>
                            <div className="verify-detail-row">
                                <Calendar />
                                <div>
                                    <div className="verify-detail-row__label">Issued On</div>
                                    <div className="verify-detail-row__value">
                                        {cert.issuedAt
                                            ? new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </div>
                                </div>
                            </div>
                            <div className="verify-detail-row">
                                <QrCode />
                                <div>
                                    <div className="verify-detail-row__label">Certificate ID</div>
                                    <div className="verify-detail-row__value verify-detail-row__value--mono">{cert.certId}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="verify-actions">
                            {cert.pdfUrl && isValid && (
                                <a
                                    href={cert.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="verify-btn-download"
                                >
                                    <Download /> Download PDF
                                </a>
                            )}
                            {cert.recipientSlug && (
                                <Link
                                    to={`/achievement/${cert.recipientSlug}`}
                                    className="verify-btn-achievements"
                                >
                                    View Achievements
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
