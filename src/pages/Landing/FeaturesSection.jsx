import { useRef } from 'react'
import {
    Users, FileSpreadsheet, QrCode,
    Trophy, Linkedin, ShieldOff, BarChart3,
} from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './FeaturesSection.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const features = [
    {
        icon: Users,
        colorCls: 'bg-accent-icon',
        title: 'Role Hierarchy System',
        desc: 'Four-tier access: Super Admin → Principal → HOD → Staff. Each role sees only their relevant data and controls.',
        mockup: (
            <div>
                {[
                    { role: 'Super Admin', perms: 'Manage Orgs · Global Revoke', color: '#ef4444' },
                    { role: 'Principal', perms: 'Org Analytics · All Depts', color: '#3b82f6' },
                    { role: 'HOD', perms: 'Dept Reports · Staff Mgmt', color: '#8b5cf6' },
                    { role: 'Staff', perms: 'Generate Certs · Upload CSV', color: '#22c55e' },
                ].map((r) => (
                    <div key={r.role} className="f-card hover-lift">
                        <div className="f-card__row">
                            <div className="f-card__dot" style={{ background: r.color }} />
                            <div>
                                <div className="f-card__name">{r.role}</div>
                                <div className="f-card__sub">{r.perms}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: FileSpreadsheet,
        colorCls: 'bg-green-icon',
        title: 'Bulk CSV Certificate Generation',
        desc: 'Upload a CSV with names and emails — our system generates, designs, and delivers certificates to every recipient automatically.',
        mockup: (
            <div>
                <div className="f-dashed-upload hover-lift">
                    <FileSpreadsheet />
                    <div className="f-dashed-upload__name">students.csv</div>
                    <div className="f-dashed-upload__sub">342 records · Ready</div>
                </div>
                <div className="f-card hover-lift" style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5, color: 'var(--c-text-faint)' }}>
                        <span>Generating...</span><span>87%</span>
                    </div>
                    <div className="f-progress"><div className="f-progress__bar" style={{ width: '87%' }} /></div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 5 }}>298/342 certificates · Emailing...</div>
                </div>
            </div>
        ),
    },
    {
        icon: QrCode,
        colorCls: 'bg-cyan-icon',
        title: 'QR-Based Instant Verification',
        desc: 'Every certificate contains a unique QR code. Anyone can scan it to instantly verify authenticity — no login required.',
        mockup: (
            <div className="f-qr hover-lift">
                <div className="f-qr__box"><QrCode /></div>
                <div className="f-qr__info">
                    <div className="f-qr__verified">✓ VERIFIED — Authentic</div>
                    <div className="f-qr__person">Arjun Sharma</div>
                    <div className="f-qr__org">Alpha University · 2025</div>
                </div>
            </div>
        ),
    },
    {
        icon: ShieldOff,
        colorCls: 'bg-red-icon',
        title: 'Certificate Revocation System',
        desc: 'Principals and Super Admins can instantly revoke certificates. The verification page immediately reflects the revoked status.',
        mockup: (
            <div className="f-revoke">
                {[
                    { id: 'CERT-2025-00312', name: 'Rahul Verma · CS Dept', status: 'REVOKED', cls: 'f-badge--red' },
                    { id: 'CERT-2025-00298', name: 'Priya Nair · EE Dept', status: 'VALID', cls: 'f-badge--green' },
                ].map((c) => (
                    <div key={c.id} className="f-card hover-lift">
                        <div className="f-card__row">
                            <div style={{ flex: 1 }}>
                                <div className="f-card__name">{c.id}</div>
                                <div className="f-card__sub">{c.name}</div>
                            </div>
                            <span className={`f-badge ${c.cls}`}>{c.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: Linkedin,
        colorCls: 'bg-blue-icon',
        title: 'LinkedIn Sharing',
        desc: "Recipients can share their achievement directly to LinkedIn with a pre-filled post, increasing your organization's visibility.",
        mockup: (
            <div className="f-linkedin hover-lift">
                <div className="f-linkedin__header">
                    <div className="f-linkedin__icon"><Linkedin /></div>
                    <div>
                        <div className="f-linkedin__title">Share on LinkedIn</div>
                        <div className="f-linkedin__sub">Pre-filled post ready</div>
                    </div>
                </div>
                <div className="f-linkedin__quote">"Proud to receive my certificate from Alpha University! 🎓 #Achievement"</div>
                <div className="f-linkedin__btn">Share Now</div>
            </div>
        ),
    },
]

export default function FeaturesSection() {
    const sectionRef = useRef()

    useGSAP(() => {
        // Batch reveal feature rows
        ScrollTrigger.batch('.features__item', {
            interval: 0.1,
            batchMax: 2,
            onEnter: (elements) => {
                gsap.fromTo(elements,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power2.out",
                        overwrite: true
                    }
                )
            },
            start: "top 80%",
        })
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} id="features" className="features">
            <div className="container">
                <div className="features__header">
                    <div className="features__badge"><BarChart3 /> Everything You Need</div>
                    <h2 className="features__title">
                        Built for modern <span className="gradient-text">institutions</span>
                    </h2>
                    <p className="features__sub">From ISO-certified universities to bootcamps — Certifiqx scales with you.</p>
                </div>

                <div className="features__list">
                    {features.map((f, i) => {
                        const Icon = f.icon
                        const isEven = i % 2 === 0
                        return (
                            <div
                                key={f.title}
                                className={`features__item${isEven ? '' : ' features__item--reverse'}`}
                                style={{ opacity: 0, transform: 'translateY(50px)' }}
                            >
                                <div className="features__item-text">
                                    <div className={`features__item-icon ${f.colorCls}`}><Icon /></div>
                                    <h3 className="features__item-title">{f.title}</h3>
                                    <p className="features__item-desc">{f.desc}</p>
                                </div>
                                <div className="features__item-mockup">{f.mockup}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
