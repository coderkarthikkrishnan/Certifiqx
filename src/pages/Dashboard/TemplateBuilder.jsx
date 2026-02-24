import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from './DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { createTemplate, getTemplateById } from '../../firebase/firestore'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, Save, Type, QrCode, SlidersHorizontal, Image as ImageIcon, X, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const CANVAS_W = 842
const CANVAS_H = 595

const GOOGLE_FONTS = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald',
    'Source Sans Pro', 'Slabo 27px', 'Raleway', 'PT Sans',
    'Merriweather', 'Nunito', 'Playfair Display', 'Rubik',
    'Work Sans', 'Lora', 'Fira Sans', 'Quicksand', 'Hind',
    'Inconsolata', 'Dancing Script', 'Pacifico', 'Caveat',
    'Great Vibes', 'Cinzel'
]

/* ── Micro CSS ─────────────────────────────────────────────────────────── */
const propInput = { width: '100%', padding: '8px 12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 10, fontSize: 13, color: 'var(--c-text-primary)', outline: 'none', fontWeight: 500 }
const propLabel = { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-faint)', marginBottom: 6 }

export default function TemplateBuilder() {
    const { orgId, departmentId, role } = useAuth()
    const { templateId } = useParams()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const canvasWrapRef = useRef(null)
    const [canvasScale, setCanvasScale] = useState(1)

    // Auto-scale the 842×595 canvas to fit its container
    useEffect(() => {
        const el = canvasWrapRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            const availW = entry.contentRect.width - 48 // subtract padding
            const availH = entry.contentRect.height - 48
            const scaleW = availW / CANVAS_W
            const scaleH = availH / CANVAS_H
            setCanvasScale(Math.min(scaleW, scaleH, 1)) // never scale up beyond 1:1
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const [bgImage, setBgImage] = useState(null)
    const [templateName, setTemplateName] = useState('New Certificate Template')
    const [saving, setSaving] = useState(false)
    const [selectedField, setSelectedField] = useState(null)

    const [fields, setFields] = useState({
        recipientName: { enabled: true, x: 0, y: 140, w: 842, font: 'Helvetica', isBold: true, size: 36, color: '#1e1e2e', align: 'center', text: '{name}' },
        jobTitle: { enabled: true, x: 0, y: 212, w: 842, font: 'Helvetica', isBold: true, size: 18, color: '#6366f1', align: 'center', text: '{title}' },
        certId: { enabled: true, x: 0, y: 525, w: 842, font: 'Helvetica', isBold: false, size: 9, color: '#9ca3af', align: 'center', text: 'Certificate ID: {id}' },
        verifyUrl: { enabled: true, x: 642, y: 545, w: 150, font: 'Helvetica', isBold: false, size: 7, color: '#9ca3af', align: 'right', text: 'Verify at: {url}' },
        qrCode: { enabled: true, x: 692, y: 445, size: 100 }
    })

    useEffect(() => {
        const loadTemplate = async () => {
            if (!templateId) return
            try {
                const toastId = toast.loading('Loading template...')
                const data = await getTemplateById(templateId)
                if (data) { setTemplateName(data.name || 'Untitled Template'); setBgImage(data.backgroundUrl || null); if (data.fields) setFields(data.fields) }
                toast.dismiss(toastId)
            } catch (err) { console.error(err); toast.error('Failed to load template') }
        }
        loadTemplate()
    }, [templateId])

    const handleFileUpload = (e) => {
        const file = e.target.files[0]; if (!file) return
        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB')
        const reader = new FileReader(); reader.onload = (e) => setBgImage(e.target.result); reader.readAsDataURL(file)
    }

    const handleDragEnd = (key, info) => setFields(prev => ({ ...prev, [key]: { ...prev[key], x: prev[key].x + info.offset.x, y: prev[key].y + info.offset.y } }))
    const updateField = (key, prop, value) => setFields(prev => ({ ...prev, [key]: { ...prev[key], [prop]: value } }))

    const handleSave = async () => {
        if (!bgImage) return toast.error('Please upload a background image')
        if (!templateName.trim()) return toast.error('Please enter a template name')
        setSaving(true); const toastId = toast.loading('Saving template...')
        try {
            let backgroundUrl = bgImage
            const auth = (await import('../../firebase/firebaseConfig')).auth
            if (bgImage.startsWith('data:image')) {
                const idToken = await auth.currentUser.getIdToken()
                const res = await fetch('/.netlify/functions/upload-image', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` }, body: JSON.stringify({ imageBase64: bgImage, orgId }) })
                const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to upload image'); backgroundUrl = data.url
            }
            const targetTemplateId = templateId || uuidv4()
            await createTemplate(targetTemplateId, { orgId, departmentId: role === 'HOD' ? departmentId : null, name: templateName, createdBy: auth.currentUser.uid, role, status: role === 'PRINCIPAL' ? 'APPROVED' : 'PENDING', backgroundUrl, fields })
            toast.success('Template saved successfully', { id: toastId })
            navigate(role === 'PRINCIPAL' ? '/dashboard/principal/templates' : '/dashboard/hod/templates')
        } catch (err) { console.error(err); toast.error(err.message || 'Failed to save template', { id: toastId }) }
        finally { setSaving(false) }
    }

    const renderTextElement = (key) => {
        const field = fields[key]; if (!field.enabled) return null
        const previewText = (field.text || '').replace('{name}', '[Recipient Name]').replace('{title}', '[Job Title/Award Name]').replace('{id}', '[UUID]').replace('{url}', 'url.com')
        return (
            <motion.div
                key={key}
                drag dragMomentum={false}
                onDragEnd={(e, info) => handleDragEnd(key, info)}
                onClick={(e) => { e.stopPropagation(); setSelectedField(key) }}
                animate={{ x: field.x, y: field.y }}
                style={{ position: 'absolute', left: 0, top: 0, width: field.w, textAlign: field.align, fontFamily: field.font, fontWeight: field.isBold ? 'bold' : 'normal', fontSize: field.size, color: field.color, cursor: 'grab', border: selectedField === key ? '2px dashed #6366f1' : '2px dashed transparent', userSelect: 'none', lineHeight: 1, transition: 'border-color 0.15s', background: selectedField === key ? 'rgba(99,102,241,0.05)' : 'transparent' }}
            >
                {previewText}
            </motion.div>
        )
    }

    const renderQR = () => {
        const field = fields.qrCode; if (!field.enabled) return null
        return (
            <motion.div
                key="qrCode"
                drag dragMomentum={false}
                onDragEnd={(e, info) => handleDragEnd('qrCode', info)}
                onClick={(e) => { e.stopPropagation(); setSelectedField('qrCode') }}
                animate={{ x: field.x, y: field.y }}
                style={{ position: 'absolute', left: 0, top: 0, width: field.size, height: field.size, cursor: 'grab', border: selectedField === 'qrCode' ? '2px dashed #6366f1' : '2px dashed transparent', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
            >
                <QrCode style={{ width: '50%', height: '50%', color: '#9ca3af' }} />
            </motion.div>
        )
    }

    const renderProperties = () => {
        if (!selectedField) return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--c-text-faint)', textAlign: 'center', gap: 12, padding: 24 }}>
                <SlidersHorizontal style={{ width: 40, height: 40, strokeWidth: 1.5 }} />
                <p style={{ fontSize: 13, fontWeight: 500 }}>Select an element on the canvas to edit its properties.</p>
            </div>
        )

        const field = fields[selectedField]; const isQR = selectedField === 'qrCode'

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-text-primary)', textTransform: 'capitalize' }}>
                        {field.isCustom ? 'Custom Text Element' : selectedField.replace(/([A-Z])/g, ' $1').trim()} Properties
                    </h3>
                    <button onClick={() => setSelectedField(null)} className="role-dash__org-btn"><X style={{ width: 15, height: 15 }} /></button>
                </div>

                {isQR ? (
                    <>
                        <div><label style={propLabel}>Size (px)</label><input type="number" value={field.size} onChange={(e) => updateField(selectedField, 'size', Number(e.target.value))} style={propInput} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={propLabel}>Position X</label><input type="number" value={Math.round(field.x)} onChange={(e) => updateField(selectedField, 'x', Number(e.target.value))} style={propInput} /></div>
                            <div><label style={propLabel}>Position Y</label><input type="number" value={Math.round(field.y)} onChange={(e) => updateField(selectedField, 'y', Number(e.target.value))} style={propInput} /></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label style={propLabel}>Display Text / Format</label>
                            <input type="text" value={field.text || ''} onChange={(e) => updateField(selectedField, 'text', e.target.value)} style={propInput} />
                            <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 4 }}>Use <code>{'{name}'}</code>, <code>{'{title}'}</code>, <code>{'{id}'}</code>, or <code>{'{url}'}</code> to format data.</p>
                        </div>
                        <div>
                            <label style={propLabel}>Font Family</label>
                            <select value={field.font} onChange={(e) => updateField(selectedField, 'font', e.target.value)} style={propInput}>
                                <optgroup label="Standard Fonts">
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times-Roman">Times New Roman</option>
                                    <option value="Courier">Courier</option>
                                </optgroup>
                                <optgroup label="Google Fonts">
                                    {GOOGLE_FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                                </optgroup>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={propLabel}>Font Size</label><input type="number" value={field.size} onChange={(e) => updateField(selectedField, 'size', Number(e.target.value))} style={propInput} /></div>
                            <div>
                                <label style={propLabel}>Color (Hex)</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input type="color" value={field.color} onChange={(e) => updateField(selectedField, 'color', e.target.value)} style={{ width: 38, height: 38, padding: 3, background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 10, cursor: 'pointer' }} />
                                    <input type="text" value={field.color} onChange={(e) => updateField(selectedField, 'color', e.target.value)} style={{ ...propInput, flex: 1 }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={propLabel}>Formatting</label>
                                <button onClick={() => updateField(selectedField, 'isBold', !field.isBold)} style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: `1px solid ${field.isBold ? '#1e293b' : 'var(--c-border)'}`, background: field.isBold ? 'var(--c-text-primary)' : 'var(--c-bg)', color: field.isBold ? '#fff' : 'var(--c-text-secondary)', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>B</button>
                            </div>
                            <div>
                                <label style={propLabel}>Alignment</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, background: 'var(--c-bg)', padding: 4, borderRadius: 10, border: '1px solid var(--c-border)' }}>
                                    {['left', 'center', 'right'].map(a => (
                                        <button key={a} onClick={() => updateField(selectedField, 'align', a)} style={{ padding: '4px 0', borderRadius: 8, border: 'none', background: field.align === a ? '#fff' : 'transparent', color: field.align === a ? 'var(--c-brand)' : 'var(--c-text-faint)', fontWeight: 700, fontSize: 11, cursor: 'pointer', textTransform: 'capitalize', boxShadow: field.align === a ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>{a[0]}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={propLabel}>Container Width (px)</label>
                            <input type="number" value={field.w} onChange={(e) => updateField(selectedField, 'w', Number(e.target.value))} style={propInput} />
                            <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 4 }}>Width is used for alignment calculations.</p>
                        </div>
                    </>
                )}

                <button onClick={() => {
                    if (field.isCustom) {
                        const newFields = { ...fields }
                        delete newFields[selectedField]
                        setFields(newFields)
                    } else {
                        updateField(selectedField, 'enabled', false)
                    }
                    setSelectedField(null)
                }} className="btn btn--ghost" style={{ color: 'var(--c-danger)', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Trash2 style={{ width: 14, height: 14 }} /> {field.isCustom ? 'Delete Element' : 'Hide Element'}
                </button>
            </div>
        )
    }

    /* Google Fonts injection for canvas preview */
    const usedGoogleFonts = Object.values(fields).filter(f => f.enabled && f.font && !['Helvetica', 'Times-Roman', 'Courier'].includes(f.font)).map(f => f.font.replace(/\s+/g, '+'))
    const uniqueFonts = [...new Set(usedGoogleFonts)]
    const fontUrl = uniqueFonts.length > 0 ? `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f}:wght@400;700`).join('&')}&display=swap` : null

    return (
        <DashboardLayout>
            {fontUrl && <link href={fontUrl} rel="stylesheet" />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="db-page-title"
                        style={{ background: 'transparent', border: 'none', outline: 'none', padding: 0, fontFamily: 'inherit', cursor: 'text', width: '100%', maxWidth: 480 }}
                        placeholder="Template Name..."
                    />
                    <p className="db-page-sub">Design your custom certificate structure</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => {
                        const id = `custom_${Date.now()}`
                        setFields(prev => ({
                            ...prev,
                            [id]: { enabled: true, x: 200, y: 200, w: 400, font: 'Helvetica', isBold: false, size: 16, color: '#1e1e2e', align: 'left', text: 'Custom Field', isCustom: true }
                        }))
                        setSelectedField(id)
                    }} className="btn btn--ghost btn--sm">
                        <Type style={{ width: 14, height: 14 }} /> Add Text
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="btn btn--ghost btn--sm">
                        <ImageIcon style={{ width: 14, height: 14 }} /> Upload Background
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
                        {saving ? <div className="bouncing-loader" style={{ padding: '0 8px' }}><div></div><div></div><div></div></div> : <Save style={{ width: 14, height: 14 }} />} Save Template
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 200px)', minHeight: 600 }}>
                {/* Canvas area */}
                <div
                    ref={canvasWrapRef}
                    style={{ flex: 1, background: 'var(--c-bg)', borderRadius: 20, border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto', position: 'relative' }}
                    onClick={() => setSelectedField(null)}
                >
                    {/* Scale wrapper: reserves the scaled height so nothing clips */}
                    <div style={{ width: CANVAS_W * canvasScale, height: CANVAS_H * canvasScale, flexShrink: 0, position: 'relative' }}>
                        {/* A4 landscape canvas 842×595 — CSS-scaled to fit */}
                        <div
                            style={{
                                position: 'absolute', top: 0, left: 0,
                                width: CANVAS_W, height: CANVAS_H,
                                transform: `scale(${canvasScale})`,
                                transformOrigin: 'top left',
                                boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                                backgroundImage: bgImage ? `url("${bgImage}")` : 'none',
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                backgroundColor: bgImage ? 'transparent' : '#fff',
                                overflow: 'hidden',
                            }}
                        >
                            {!bgImage && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c4c4c4', gap: 12 }}>
                                    <ImageIcon style={{ width: 56, height: 56, strokeWidth: 1 }} />
                                    <p style={{ fontWeight: 600, fontSize: 16 }}>No Background Image</p>
                                    <p style={{ fontSize: 13 }}>Upload an A4 layout image to start mapping.</p>
                                </div>
                            )}
                            {Object.keys(fields).map(key => key === 'qrCode' ? renderQR() : renderTextElement(key))}
                        </div>
                    </div>
                </div>

                {/* Right Properties Panel */}
                <div style={{ width: 300, background: 'var(--c-card)', borderRadius: 20, border: '1px solid var(--c-border)', padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {renderProperties()}

                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--c-border)' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-text-primary)', marginBottom: 14 }}>Visible Elements</h4>
                        {Object.keys(fields).map(key => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <span style={{ fontSize: 13, color: 'var(--c-text-secondary)', textTransform: 'capitalize' }}>
                                    {fields[key].isCustom ? (fields[key].text || 'Custom Field').substring(0, 15) : key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                {/* Toggle switch */}
                                <button
                                    onClick={() => updateField(key, 'enabled', !fields[key].enabled)}
                                    style={{ position: 'relative', width: 36, height: 20, borderRadius: 12, border: 'none', background: fields[key].enabled ? 'var(--c-brand)' : 'var(--c-border)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                                    role="switch" aria-checked={fields[key].enabled}
                                >
                                    <span style={{ position: 'absolute', top: 2, left: fields[key].enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
