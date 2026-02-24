import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Shield, Zap, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './HeroSection.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function Blob({ className, delay = 0 }) {
    const blobRef = useRef()

    useGSAP(() => {
        gsap.to(blobRef.current, {
            y: -20,
            scale: 1.06,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay
        })
    })

    return <div ref={blobRef} className={`hero__blob ${className}`} />
}

function DashboardMockup() {
    const bars = [40, 65, 50, 80, 60, 90, 75, 85, 70, 95, 60, 100]
    const mockupRef = useRef()
    const floatTopRef = useRef()
    const floatBotRef = useRef()

    // The entrance animation is handled by the main timeline in HeroSection

    useGSAP(() => {
        // Subtle infinite glass float
        gsap.to(mockupRef.current, {
            y: -5,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        })

        // Badge floats
        gsap.to(floatTopRef.current, {
            y: -8,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        })

        gsap.to(floatBotRef.current, {
            y: 8,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1
        })
    })

    return (
        <div ref={mockupRef} className="hero__mockup hero-elem" style={{ opacity: 0, transform: 'translateY(40px)' }}>
            <div className="hero__mock-card">
                {/* Top bar */}
                <div className="hero__mock-topbar">
                    <div className="hero__mock-dots">
                        <div className="hero__mock-dot hero__mock-dot--red" />
                        <div className="hero__mock-dot hero__mock-dot--yellow" />
                        <div className="hero__mock-dot hero__mock-dot--green" />
                    </div>
                    <div className="hero__mock-urlbar">
                        <div className="hero__mock-urlbar-pill hero__mock-urlbar-pill--long" />
                        <div className="hero__mock-urlbar-pill hero__mock-urlbar-pill--short" />
                    </div>
                </div>

                {/* Stat row */}
                <div className="hero__mock-stats">
                    {[
                        { label: 'Certificates', value: '2,847', cls: 'hero__mock-stat-label--brand' },
                        { label: 'This Month', value: '342', cls: 'hero__mock-stat-label--green' },
                        { label: 'Departments', value: '12', cls: 'hero__mock-stat-label--accent' },
                    ].map((s) => (
                        <div key={s.label} className="hero__mock-stat">
                            <div className={`hero__mock-stat-label ${s.cls}`}>{s.label}</div>
                            <div className="hero__mock-stat-value">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="hero__mock-chart">
                    <div className="hero__mock-chart-label">Monthly Generation</div>
                    <div className="hero__mock-bars">
                        {bars.map((h, i) => (
                            <div
                                key={i}
                                className={`hero__mock-bar${i === bars.length - 1 ? ' hero__mock-bar--active' : ''}`}
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Recent rows */}
                <div className="hero__mock-rows">
                    {[
                        { name: 'Arjun Sharma', dept: 'Computer Science' },
                        { name: 'Priya Nair', dept: 'Electronics' },
                    ].map((c) => (
                        <div key={c.name} className="hero__mock-row">
                            <div>
                                <div className="hero__mock-row-name">{c.name}</div>
                                <div className="hero__mock-row-dept">{c.dept}</div>
                            </div>
                            <span className="hero__mock-badge">Valid</span>
                        </div>
                    ))}
                </div>

                {/* Floating badges */}
                <div ref={floatTopRef} className="hero__float-badge hero__float-badge--top">
                    <div className="hero__float-icon hero__float-icon--green"><Shield /></div>
                    <div>
                        <div className="hero__float-caption">QR Verified</div>
                        <div className="hero__float-value hero__float-value--green">Authentic</div>
                    </div>
                </div>

                <div ref={floatBotRef} className="hero__float-badge hero__float-badge--bot">
                    <div className="hero__float-icon hero__float-icon--blue"><Zap /></div>
                    <div>
                        <div className="hero__float-caption">Bulk Generated</div>
                        <div className="hero__float-value hero__float-value--blue">342 in 4s</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper to wrap characters for GSAP stagger
const SplitText = ({ children }) => {
    if (typeof children !== 'string') return children

    // Split by words first to keep them together, then characters
    return children.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'pre', color: 'inherit' }}>
            {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="hero-char" style={{ display: 'inline-block', opacity: 0, transform: 'translateY(15px)', filter: 'blur(4px)', color: 'inherit' }}>
                    {char}
                </span>
            ))}
            {' '}
        </span>
    ))
}

export default function HeroSection() {
    const { currentUser, role } = useAuth()
    const sectionRef = useRef()
    const btnRef = useRef()

    const roleHome = {
        superadmin: '/dashboard/super',
        principal: '/dashboard/principal',
        hod: '/dashboard/hod',
        staff: '/dashboard/staff',
    }
    const dashboardUrl = roleHome[role] || '/dashboard'

    useGSAP(() => {
        // --- 1. Page Load Timeline ---
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        // Stagger characters in title
        tl.to('.hero-char', {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: 0.02,
            delay: 0.1
        }, 0)

        // Other elements
        tl.fromTo('.hero-elem',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
            0.2
        )

        // Button scale
        tl.fromTo('.hero__cta-primary',
            { scale: 0.95 },
            { scale: 1, duration: 0.8, ease: "back.out(1.5)" },
            0.4
        )

        // --- 2. Background Parallax ---
        gsap.to('.hero__bg-img', {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        })

    }, { scope: sectionRef })

    // Magnetic Button Effect
    useEffect(() => {
        const btn = btnRef.current
        if (!btn) return

        const handleMouseMove = (e) => {
            const rect = btn.getBoundingClientRect()
            const h = rect.width / 2
            const w = rect.height / 2
            const x = e.clientX - rect.left - h
            const y = e.clientY - rect.top - w

            // Subtle 15px max movement
            gsap.to(btn, {
                x: x * 0.15,
                y: y * 0.15,
                duration: 0.4,
                ease: "power2.out",
                scale: 1.05,
                boxShadow: '0 12px 24px rgba(37, 99, 235, 0.25)'
            })
        }

        const handleMouseLeave = () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)",
                scale: 1,
                boxShadow: 'none'
            })
        }

        btn.addEventListener('mousemove', handleMouseMove)
        btn.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            btn.removeEventListener('mousemove', handleMouseMove)
            btn.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    return (
        <section ref={sectionRef} className="hero">
            <div className="hero__bg-img" />
            <Blob className="hero__blob--1" delay={0} />
            <Blob className="hero__blob--2" delay={2} />

            <div className="hero__container">
                {/* Text */}
                <div className="hero__text">
                    <div className="hero__badge hero-elem" style={{ opacity: 0 }}>
                        <Globe />
                        Multi-Organization Platform
                    </div>

                    <h1 className="hero__heading">
                        <SplitText>Secure Digital </SplitText>
                        <span style={{ color: 'var(--c-brand)' }}><SplitText>Certificates</SplitText></span>{' '}
                        <SplitText>with Instant </SplitText>
                        <span style={{ color: 'var(--c-brand)' }}><SplitText>Verification</SplitText></span>
                    </h1>

                    <p className="hero__sub hero-elem" style={{ opacity: 0 }}>
                        Generate certificates in bulk, embed cryptographic QR codes,
                        and manage your entire organization from a premium dashboard.
                    </p>

                    <div className="hero__ctas hero-elem" style={{ opacity: 0 }}>
                        {currentUser ? (
                            <Link ref={btnRef} to={dashboardUrl} className="hero__cta-primary magnetic-wrap">
                                Go to Dashboard
                                <ArrowRight />
                            </Link>
                        ) : (
                            <Link ref={btnRef} to="/register" className="hero__cta-primary magnetic-wrap">
                                Start Free
                                <ArrowRight />
                            </Link>
                        )}
                    </div>

                    <div className="hero__stats hero-elem" style={{ opacity: 0 }}>
                        {[
                            { value: '50K+', label: 'Certificates' },
                            { value: '200+', label: 'Organizations' },
                            { value: '99.9%', label: 'Uptime' },
                        ].map((s) => (
                            <div key={s.label}>
                                <div className="hero__stat-value">{s.value}</div>
                                <div className="hero__stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <DashboardMockup />
            </div>
        </section>
    )
}
