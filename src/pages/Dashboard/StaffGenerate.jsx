import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../firebase/firebaseConfig'
import Papa from 'papaparse'
import { Upload, FileSpreadsheet, CheckCircle, LayoutTemplate, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApprovedTemplates } from '../../firebase/firestore'

const styles = `
.gen-layout { display: flex; gap: 24px; align-items: flex-start; max-width: 1000px; }
.gen-card { background: var(--c-card); border: 1px solid var(--c-border); border-radius: var(--r-2xl); padding: 28px; box-shadow: var(--shadow-card); flex: 1; min-width: 0; }
.gen-sidebar { width: 300px; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: var(--r-xl); padding: 24px; display: flex; flex-direction: column; gap: 16px; flex-shrink: 0; position: sticky; top: 24px; }
.gen-sidebar h3 { font-size: 14px; font-weight: 700; color: var(--c-text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.gen-sidebar p { font-size: 13px; color: var(--c-text-secondary); line-height: 1.5; margin-bottom: 12px; }
.gen-sidebar-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; font-family: monospace; font-size: 13px; }
.gen-sidebar-list span { background: var(--c-card); padding: 6px 10px; border-radius: var(--r-md); border: 1px solid var(--c-divider); color: var(--c-brand); font-weight: 600; display: flex; align-items: center; gap: 6px; }
.gen-sidebar-list span::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: var(--c-brand); }
.gen-sidebar-warning { font-size: 12px; color: var(--c-warning-text, #b45309); background: var(--c-warning-bg, #fef3c7); padding: 12px; border-radius: var(--r-lg); border: 1px solid rgba(217,119,6,0.2); line-height: 1.4; display: flex; gap: 8px; align-items: flex-start; }
.gen-label { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--c-text-secondary); margin-bottom: 8px; }
.gen-label svg { width: 15px; height: 15px; color: var(--c-brand); }
.gen-select-wrap { position: relative; }
.gen-select-wrap select { width: 100%; padding: 11px 38px 11px 14px; border-radius: var(--r-lg); border: 1px solid var(--c-input-border); background: var(--c-bg); color: var(--c-text-primary); font-size: 14px; appearance: none; transition: border-color var(--t-fast), box-shadow var(--t-fast); }
.gen-select-wrap select:focus { border-color: var(--c-brand); box-shadow: 0 0 0 3px var(--c-brand-light); outline: none; }
.gen-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.gen-select-arrow svg { width: 15px; height: 15px; color: var(--c-text-faint); }
.gen-drop-zone { border: 2px dashed var(--c-border); border-radius: var(--r-xl); padding: 40px 24px; text-align: center; cursor: pointer; transition: border-color var(--t-fast), background var(--t-fast); }
.gen-drop-zone:hover { border-color: var(--c-brand); background: var(--c-brand-light); }
.gen-drop-zone--loaded { border-color: var(--c-success); background: var(--c-success-bg); }
.gen-drop-zone svg { width: 40px; height: 40px; margin: 0 auto 8px; }
.gen-drop-zone__title { font-size: 14px; font-weight: 600; color: var(--c-text-secondary); }
.gen-drop-zone__sub   { font-size: 12px; color: var(--c-text-faint); margin-top: 4px; }
.gen-preview { margin-top: 20px; border: 1px solid var(--c-border); border-radius: var(--r-lg); overflow: hidden; }
.gen-preview__header { background: var(--c-bg); padding: 8px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--c-text-faint); }
.gen-preview__row { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-top: 1px solid var(--c-divider); font-size: 13px; }
.gen-preview__name  { font-weight: 600; color: var(--c-text-secondary); }
.gen-preview__email { color: var(--c-text-muted); }

@media (max-width: 768px) {
  .gen-layout { flex-direction: column; gap: 16px; }
  .gen-sidebar { width: 100%; position: static; padding: 20px; }
  .gen-card { padding: 20px; }
}
`

export default function StaffGenerate() {
    const { orgId, departmentId } = useAuth()
    const [generating, setGenerating] = useState(false)
    const [csvFile, setCsvFile] = useState(null)
    const [csvRows, setCsvRows] = useState([])
    const [jobTitle, setJobTitle] = useState('')
    const [templates, setTemplates] = useState([])
    const [selectedTemplateId, setSelectedTemplateId] = useState('')
    const fileRef = useRef()

    useEffect(() => {
        if (!orgId) return
        getApprovedTemplates(orgId, departmentId).then(docs => {
            setTemplates(docs.map(d => ({ id: d.id, ...d.data() })))
            if (docs.length > 0) setSelectedTemplateId(docs[0].id)
        }).catch(err => { console.error(err); toast.error('Failed to load approved templates') })
    }, [orgId, departmentId])

    const handleCSV = (file) => {
        setCsvFile(file)
        Papa.parse(file, { header: true, skipEmptyLines: true, complete: (r) => { setCsvRows(r.data); toast.success(`${r.data.length} recipients loaded`) }, error: () => toast.error('Failed to parse CSV') })
    }

    const handleDrop = (e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleCSV(file) }

    const handleGenerate = async () => {
        if (!csvRows.length) return toast.error('Please upload a CSV first')
        if (!jobTitle.trim()) return toast.error('Please enter a certificate title')
        if (!selectedTemplateId) return toast.error('Please select an approved template')
        setGenerating(true)
        try {
            const token = await auth.currentUser.getIdToken()
            const res = await fetch('/.netlify/functions/generate-certificates', {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ orgId, jobTitle, recipients: csvRows, templateId: selectedTemplateId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Generation failed')

            if (data.failed === 0) {
                toast.success(`✅ Successfully generated ${data.success} certificates!`)
            } else if (data.success > 0 && data.failed > 0) {
                toast.error(`⚠️ Generated ${data.success}, but ${data.failed} failed.`)
            } else {
                toast.error(`❌ Failed to generate certificates (all ${data.failed} failed).`)
            }

            setCsvFile(null); setCsvRows([]); setJobTitle('')
        } catch (err) { toast.error(err.message) }
        finally { setGenerating(false) }
    }

    return (
        <DashboardLayout>
            <style>{styles}</style>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">Generate Certificates</h1>
                    <p className="db-page-sub">Upload a CSV to dispatch certificates to recipients in your department.</p>
                </div>
            </div>

            <div className="gen-layout">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gen-card">
                    {/* Template selection */}
                    <div style={{ marginBottom: 20 }}>
                        <label className="gen-label"><LayoutTemplate /> Choose Approved Template</label>
                        <div className="gen-select-wrap">
                            <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} disabled={templates.length === 0}>
                                {templates.length === 0 && <option value="">No approved templates available</option>}
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name} {t.role === 'PRINCIPAL' ? '(Global)' : ''}</option>)}
                            </select>
                            <span className="gen-select-arrow"><ChevronDown /></span>
                        </div>
                    </div>

                    {/* Job title */}
                    <div style={{ marginBottom: 20 }}>
                        <label className="gen-label">Certificate Title / Event Name</label>
                        <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Full Stack Web Development Boot Camp 2024" className="auth-input" style={{ paddingLeft: 14 }} />
                    </div>

                    {/* Drop zone */}
                    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} className={`gen-drop-zone${csvFile ? ' gen-drop-zone--loaded' : ''}`}>
                        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleCSV(e.target.files[0])} />
                        {csvFile ? (
                            <>
                                <CheckCircle style={{ color: 'var(--c-success)' }} />
                                <div className="gen-drop-zone__title" style={{ color: 'var(--c-success)' }}>{csvFile.name}</div>
                                <div className="gen-drop-zone__sub" style={{ color: 'var(--c-success)' }}>{csvRows.length} recipients ready</div>
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet style={{ color: 'var(--c-text-faint)' }} />
                                <div className="gen-drop-zone__title">Drop CSV file here or click to browse</div>
                                <div className="gen-drop-zone__sub">Match your columns to the required fields</div>
                            </>
                        )}
                    </div>

                    {/* Preview */}
                    {csvRows.length > 0 && (
                        <div className="gen-preview">
                            <div className="gen-preview__header">Preview (first 3 rows)</div>
                            {csvRows.slice(0, 3).map((row, i) => (
                                <div key={i} className="gen-preview__row" style={{ overflowX: 'auto' }}>
                                    {Object.entries(row).map(([k, v], idx) => (
                                        <span key={idx} style={{
                                            fontWeight: k === 'name' ? 600 : 400,
                                            color: k === 'name' ? 'var(--c-text-secondary)' : 'var(--c-text-muted)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {k === 'name' || k === 'email' ? v : `${k}: ${v}`}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={handleGenerate} disabled={generating || !csvRows.length || !jobTitle.trim()} className="auth-submit" style={{ marginTop: 20 }}>
                        {generating ? <><div className="spinner" /> Generating {csvRows.length} certificates…</> : <><Upload style={{ width: 16, height: 16 }} /> Generate {csvRows.length || ''} Certificates</>}
                    </button>
                </motion.div>

                {/* Requirements Sidebar */}
                {selectedTemplateId && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="gen-sidebar">
                        <h3><FileSpreadsheet style={{ width: 18, height: 18, color: 'var(--c-brand)' }} /> Required CSV Columns</h3>
                        <p>Your uploaded CSV file must contain the following exact column headers to map data correctly:</p>

                        <div className="gen-sidebar-list">
                            <span>name</span>
                            <span>email</span>
                            {(() => {
                                const tpl = templates.find(t => t.id === selectedTemplateId)
                                if (!tpl || !tpl.fields) return null

                                // Extract any custom {field} tags used in this template (excluding standard ones)
                                const customFields = new Set()
                                Object.values(tpl.fields).forEach(f => {
                                    if (!f.enabled || !f.text) return
                                    const matches = f.text.match(/\{([^}]+)\}/g)
                                    if (matches) {
                                        matches.forEach(m => {
                                            const key = m.replace(/[{}]/g, '')
                                            if (!['name', 'title', 'id', 'url'].includes(key)) customFields.add(key)
                                        })
                                    }
                                })

                                return Array.from(customFields).map(field => (
                                    <span key={field} style={{ color: '#10b981' }}>{field}</span>
                                ))
                            })()}
                        </div>

                        <div className="gen-sidebar-warning">
                            <span style={{ fontSize: 14 }}>⚠️</span>
                            <div>
                                <strong>Crucial:</strong> The column headers in your CSV file must match these names <strong>exactly</strong> (case-sensitive) or the data will be blank on your certificates.
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    )
}
