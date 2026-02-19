import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getCertificatesByOrg, getMonthlyUsage, getSubscription } from '../../firebase/firestore'
import { auth } from '../../firebase/firebaseConfig'
import Papa from 'papaparse'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const PLAN_LIMITS = { free: 200, pro: 5000, enterprise: Infinity }

export default function StaffDashboard() {
    const { orgId, userProfile } = useAuth()
    const [certs, setCerts] = useState([])
    const [monthly, setMonthly] = useState(0)
    const [plan, setPlan] = useState('free')
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [csvFile, setCsvFile] = useState(null)
    const [csvRows, setCsvRows] = useState([])
    const [jobTitle, setJobTitle] = useState('')
    const fileRef = useRef()

    useEffect(() => {
        if (!orgId) return
        Promise.all([
            getCertificatesByOrg(orgId),
            getMonthlyUsage(orgId),
            getSubscription(orgId),
        ]).then(([snap, mon, sub]) => {
            setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setMonthly(mon)
            if (sub.exists()) setPlan(sub.data().plan || 'free')
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [orgId])

    const limit = PLAN_LIMITS[plan] || 200
    const usagePct = Math.min((monthly / limit) * 100, 100)
    const remaining = Math.max(limit - monthly, 0)

    const handleCSV = (file) => {
        setCsvFile(file)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                setCsvRows(result.data)
                toast.success(`${result.data.length} recipients loaded`)
            },
            error: () => toast.error('Failed to parse CSV'),
        })
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleCSV(file)
    }

    const handleGenerate = async () => {
        if (!csvRows.length) return toast.error('Please upload a CSV first')
        if (!jobTitle.trim()) return toast.error('Please enter a certificate title')
        if (monthly + csvRows.length > limit) {
            return toast.error(`Plan limit exceeded. You have ${remaining} remaining this month.`)
        }

        setGenerating(true)
        try {
            const token = await auth.currentUser.getIdToken()
            const res = await fetch('/.netlify/functions/generate-certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ orgId, jobTitle, recipients: csvRows }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Generation failed')
            toast.success(`✅ ${data.success} certificates generated! ${data.failed} failed.`)
            setCsvFile(null); setCsvRows([]); setJobTitle('')
            // Refresh
            const [snap, mon] = await Promise.all([getCertificatesByOrg(orgId), getMonthlyUsage(orgId)])
            setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setMonthly(mon)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setGenerating(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900">
                    Hi, {userProfile?.name?.split(' ')[0] || 'Staff'} 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">Generate and manage certificates for your department.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Usage card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 soft-card rounded-3xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-700">Monthly Usage</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${plan === 'pro' ? 'bg-brand-100 text-brand-700' :
                                plan === 'enterprise' ? 'bg-accent-100 text-accent-700' :
                                    'bg-gray-100 text-gray-600'}`}>{plan}</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{monthly}</div>
                    <div className="text-xs text-gray-400 mb-3">of {limit === Infinity ? '∞' : limit} certificates</div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usagePct}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${usagePct > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-brand-400 to-accent-500'}`}
                        />
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{remaining === Infinity ? '∞' : remaining} remaining this month</div>
                </motion.div>

                {/* Quick stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 grid grid-cols-2 gap-4"
                >
                    {[
                        { label: 'Total Generated', value: certs.length, color: 'bg-brand-100 text-brand-600' },
                        { label: 'Valid Certs', value: certs.filter(c => c.status !== 'revoked').length, color: 'bg-green-100 text-green-600' },
                        { label: 'Revoked', value: certs.filter(c => c.status === 'revoked').length, color: 'bg-red-100 text-red-500' },
                        { label: 'This Month', value: monthly, color: 'bg-accent-100 text-accent-600' },
                    ].map((s) => (
                        <div key={s.label} className={`soft-card rounded-2xl p-4`}>
                            <div className={`text-2xl font-black text-gray-900`}>{s.value}</div>
                            <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Generator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="soft-card rounded-3xl p-6 mb-6"
            >
                <h3 className="font-bold text-gray-800 mb-5">Generate Certificates</h3>

                {/* Job title */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Certificate Title</label>
                    <input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Full Stack Web Development"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none text-sm transition-all"
                    />
                </div>

                {/* CSV drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${csvFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/40'
                        }`}
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => e.target.files[0] && handleCSV(e.target.files[0])}
                    />
                    {csvFile ? (
                        <div>
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <div className="font-semibold text-green-700">{csvFile.name}</div>
                            <div className="text-xs text-green-600 mt-1">{csvRows.length} recipients ready</div>
                        </div>
                    ) : (
                        <div>
                            <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <div className="font-semibold text-gray-600">Drop CSV file here or click to browse</div>
                            <div className="text-xs text-gray-400 mt-1">Required columns: <code>name</code>, <code>email</code></div>
                        </div>
                    )}
                </div>

                {/* Preview rows */}
                {csvRows.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">Preview (first 3 rows)</div>
                        {csvRows.slice(0, 3).map((row, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-50 text-sm">
                                <span className="font-semibold text-gray-700">{row.name}</span>
                                <span className="text-gray-400">{row.email}</span>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={generating || !csvRows.length || !jobTitle.trim()}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-900 hover:bg-brand-600 text-white font-bold text-sm transition-all btn-glow disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating {csvRows.length} certificates...</>
                    ) : (
                        <><Upload className="w-4 h-4" /> Generate {csvRows.length || ''} Certificates</>
                    )}
                </button>
            </motion.div>

            {/* Certificates table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="soft-card rounded-3xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">My Certificates</h3>
                    <span className="text-xs text-gray-400">{certs.length} total</span>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-6 py-3 text-left">Recipient</th>
                                    <th className="px-6 py-3 text-left">Email</th>
                                    <th className="px-6 py-3 text-left">Title</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Download</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {certs.slice(0, 20).map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-gray-800">{c.recipientName}</td>
                                        <td className="px-6 py-3 text-gray-500 text-xs">{c.recipientEmail}</td>
                                        <td className="px-6 py-3 text-gray-600 text-xs">{c.jobTitle}</td>
                                        <td className="px-6 py-3">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === 'revoked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                {c.status === 'revoked' ? 'Revoked' : 'Valid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-400">
                                            {c.issuedAt?.toDate?.()?.toLocaleDateString() || '—'}
                                        </td>
                                        <td className="px-6 py-3">
                                            {c.pdfUrl ? (
                                                <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-semibold">
                                                    <Download className="w-3 h-3" /> PDF
                                                </a>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {certs.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No certificates yet. Upload a CSV to get started.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    )
}
