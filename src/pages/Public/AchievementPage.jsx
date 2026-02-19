import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCertificatesBySlug } from '../../firebase/firestore'
import { Download, Linkedin, ArrowLeft, Award, Building2, Calendar } from 'lucide-react'

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
        const text = encodeURIComponent(`Proud to receive my "${cert.jobTitle}" certificate from ${cert.orgName}! 🎓\n\nVerify: ${window.location.origin}/verify/${cert.certId}\n\n#Achievement #Certificate #CertifyPro`)
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
                <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb] py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="flex items-center gap-2 mb-10 group text-sm text-gray-400 hover:text-brand-600 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to CertifyPro
                </Link>

                {/* Profile card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="soft-card rounded-3xl p-8 text-center mb-8 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-accent-50" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-glow">
                            {initials}
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">{name}</h1>
                        <p className="text-gray-500 text-sm">
                            {certs.length} certificate{certs.length !== 1 ? 's' : ''} · certifypro.app/achievement/{slug}
                        </p>
                        <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-white border border-brand-100 text-brand-700 text-xs font-bold shadow-soft">
                            <Award className="w-3.5 h-3.5" /> Verified Achiever
                        </div>
                    </div>
                </motion.div>

                {/* Certificates grid */}
                {certs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No certificates found for this profile.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-5">
                        {certs.map((cert, i) => (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="soft-card rounded-3xl overflow-hidden hover:shadow-card transition-all"
                            >
                                {/* Card top accent */}
                                <div className="h-1.5 bg-gradient-to-r from-brand-500 to-accent-500" />

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-xs font-black">
                                            {cert.orgName?.[0] || 'C'}
                                        </div>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verified</span>
                                    </div>

                                    <h3 className="font-black text-gray-900 text-base mb-1 leading-tight">{cert.jobTitle}</h3>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                                        <Building2 className="w-3 h-3" /> {cert.orgName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                                        <Calendar className="w-3 h-3" />
                                        {cert.issuedAt?.toDate?.()?.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) || '—'}
                                    </div>

                                    <div className="flex gap-2">
                                        {cert.pdfUrl && (
                                            <a
                                                href={cert.pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </a>
                                        )}
                                        <button
                                            onClick={() => linkedInShare(cert)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition-colors"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" /> Share
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
