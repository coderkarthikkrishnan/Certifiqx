import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldOff, Download, ArrowLeft, Calendar, Building2, QrCode } from 'lucide-react'

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
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
                <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
        )
    }

    const isValid = cert && cert.status !== 'revoked'

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6">
            <Link to="/" className="flex items-center gap-2 mb-10 group">
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                <span className="text-sm text-gray-400 group-hover:text-brand-600 font-medium transition-colors">Back to CertifyPro</span>
            </Link>

            {error ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="soft-card rounded-3xl p-10 text-center max-w-md w-full"
                >
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                        <ShieldOff className="w-10 h-10 text-gray-300" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-800 mb-2">Certificate Not Found</h1>
                    <p className="text-gray-500 text-sm">The certificate ID <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{id}</code> does not exist or has been deleted.</p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="soft-card rounded-3xl overflow-hidden max-w-lg w-full"
                >
                    {/* Status banner */}
                    <div className={`py-5 px-8 text-center ${isValid ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                        <div className="flex items-center justify-center gap-3">
                            {isValid
                                ? <ShieldCheck className="w-8 h-8 text-white" />
                                : <ShieldOff className="w-8 h-8 text-white" />
                            }
                            <div>
                                <div className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">
                                    {isValid ? 'Certificate Status' : 'Certificate Status'}
                                </div>
                                <div className="text-white text-2xl font-black">
                                    {isValid ? '✓ VALID' : '✗ REVOKED'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Certificate details */}
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <div className="text-3xl font-black text-gray-900 mb-1">{cert.recipientName}</div>
                            <div className="text-gray-500 text-sm">has been awarded the certificate of</div>
                            <div className="text-lg font-bold text-brand-600 mt-1">{cert.jobTitle}</div>
                        </div>

                        <div className="space-y-3 mb-7">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">Organization</div>
                                    <div className="text-sm font-semibold text-gray-800">{cert.orgName}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">Issued On</div>
                                    <div className="text-sm font-semibold text-gray-800">
                                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                                <QrCode className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">Certificate ID</div>
                                    <div className="text-xs font-mono font-semibold text-gray-700 break-all">{cert.certId}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {cert.pdfUrl && isValid && (
                                <a
                                    href={cert.pdfUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-brand-600 transition-all btn-glow"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </a>
                            )}
                            {cert.recipientSlug && (
                                <Link
                                    to={`/achievement/${cert.recipientSlug}`}
                                    className="flex-1 text-center py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:border-brand-300 hover:text-brand-600 transition-all"
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
