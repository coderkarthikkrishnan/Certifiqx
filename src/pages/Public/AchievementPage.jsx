import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCertificatesBySlug } from '../../firebase/firestore'
import { Download, Linkedin, ArrowLeft, Award, Building2, Calendar } from 'lucide-react'
import './AchievementPage.css'

export default function AchievementPage() {
    const { slug } = useParams()
    const [certs, setCerts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCertificatesBySlug(slug).then((snap) => {
            setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.status !== 'revoked'))
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [slug])

    const name = certs[0]?.recipientName || slug
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    const linkedInShare = (cert) => {
        const text = encodeURIComponent(`Proud to receive my "${cert.jobTitle}" certificate from ${cert.orgName}! 🎓\n\nVerify: ${window.location.origin}/verify/${cert.certId}\n\n#Achievement #Certificate #Certifiqx`)
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank')
    }

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
                <div className="spinner" />
            </div>
        )
    }

    return (
        <div className="achiev-page">
            <div className="achiev-container">
                <Link to="/" className="achiev-back">
                    <ArrowLeft /> Back to Certifiqx
                </Link>

                {/* Profile header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="achiev-header"
                >
                    <div className="achiev-header-content">
                        <div className="achiev-avatar">
                            {initials}
                        </div>
                        <h1 className="achiev-name">{name}</h1>
                        <p className="achiev-meta">
                            {certs.length} certificate{certs.length !== 1 ? 's' : ''} · certifiqx.app/achievement/{slug}
                        </p>
                        <div className="achiev-verified-badge">
                            <Award /> Verified Achiever
                        </div>
                    </div>
                </motion.div>

                {/* Certificates grid */}
                {certs.length === 0 ? (
                    <div className="achiev-empty">
                        <Award />
                        <p>No certificates found for this profile.</p>
                    </div>
                ) : (
                    <div className="achiev-grid">
                        {certs.map((cert, i) => (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="achiev-card"
                            >
                                <div className="achiev-card-top" />
                                <div className="achiev-card-body">
                                    <div className="achiev-card-header">
                                        <div className="achiev-org-logo">
                                            {cert.orgName?.[0] || 'C'}
                                        </div>
                                        <span className="badge badge--success">Verified</span>
                                    </div>

                                    <h3 className="achiev-cert-title">{cert.jobTitle}</h3>

                                    <div className="achiev-cert-detail">
                                        <Building2 /> {cert.orgName}
                                    </div>
                                    <div className="achiev-cert-detail">
                                        <Calendar />
                                        {cert.issuedAt?.toDate?.()?.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) || '—'}
                                    </div>

                                    <div className="achiev-actions">
                                        {cert.pdfUrl && (
                                            <a
                                                href={cert.pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="achiev-btn achiev-btn-download"
                                            >
                                                <Download /> Download
                                            </a>
                                        )}
                                        <button
                                            onClick={() => linkedInShare(cert)}
                                            className="achiev-btn achiev-btn-share"
                                        >
                                            <Linkedin /> Share
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
