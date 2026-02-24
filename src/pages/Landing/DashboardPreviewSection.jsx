import { useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './DashboardPreviewSection.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const monthlyData = [
    { month: 'Sep', certs: 210 },
    { month: 'Oct', certs: 340 },
    { month: 'Nov', certs: 290 },
    { month: 'Dec', certs: 480 },
    { month: 'Jan', certs: 420 },
    { month: 'Feb', certs: 612 },
]

const deptData = [
    { dept: 'CS', certs: 248 },
    { dept: 'EE', certs: 193 },
    { dept: 'ME', certs: 87 },
    { dept: 'Civil', certs: 64 },
    { dept: 'MBA', certs: 120 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="preview__tooltip">
                <div className="preview__tooltip-label">{label}</div>
                <div className="preview__tooltip-value">{payload[0].value} certs</div>
            </div>
        )
    }
    return null
}

export default function DashboardPreviewSection() {
    const sectionRef = useRef()
    const frameRef = useRef()

    useGSAP(() => {
        // Frame Entrance
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 75%",
                once: true
            }
        })

        tl.fromTo(frameRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        )

        // Number Counter Animation for KPIs
        const kpiNodes = gsap.utils.toArray('.js-counter')
        kpiNodes.forEach((node) => {
            const finalValue = parseInt(node.getAttribute('data-val').replace(/,/g, ''), 10)
            const isFormatted = node.getAttribute('data-val').includes(',')

            gsap.to(node, {
                innerHTML: finalValue,
                duration: 1.5,
                snap: { innerHTML: 1 },
                ease: "power2.out",
                onUpdate: function () {
                    if (isFormatted) {
                        node.innerHTML = Math.ceil(this.targets()[0].innerHTML).toLocaleString()
                    }
                },
                scrollTrigger: {
                    trigger: node,
                    start: "top 85%",
                    once: true
                }
            })
        })

        // Glass float animation
        gsap.to(frameRef.current, {
            y: -5,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 0.8
        })

        // Staff Progress Bars Stagger
        gsap.fromTo('.preview__staff-fill',
            { width: 0 },
            {
                width: (i, el) => el.getAttribute('data-pct') + '%',
                duration: 1,
                ease: "power3.out",
                stagger: 0.15,
                scrollTrigger: {
                    trigger: '.preview__staff',
                    start: "top 85%",
                    once: true
                }
            }
        )
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} id="preview" className="preview">
            <div className="container">
                <div className="preview__header">
                    <h2 className="preview__title">
                        Analytics at a <span className="gradient-text">glance</span>
                    </h2>
                    <p className="preview__sub">
                        Real-time insights per role — from certificate counts to department breakdowns.
                    </p>
                </div>

                <div ref={frameRef} className="preview__frame" style={{ opacity: 0, transform: 'translateY(50px)' }}>
                    {/* Top bar */}
                    <div className="preview__topbar">
                        <div className="preview__topbar-brand">
                            <div className="preview__topbar-icon">C</div>
                            <span className="preview__topbar-name">Certifiqx Dashboard</span>
                        </div>
                        <div className="preview__topbar-right">
                            <div className="preview__topbar-pill preview__topbar-pill--w" />
                            <div className="preview__topbar-avatar">AS</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="preview__grid">
                        {/* KPI side */}
                        <div className="preview__kpis">
                            {[
                                { label: 'Total Certificates', value: '2,847', delta: '+12%', gradient: 'linear-gradient(135deg,#2563eb,#1d4ed8)' },
                                { label: 'Active This Month', value: '612', delta: '+46%', gradient: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
                                { label: 'Departments', value: '12', delta: 'All Active', gradient: 'linear-gradient(135deg,#0891b2,#0e7490)' },
                            ].map((k) => (
                                <div key={k.label} className="preview__kpi" style={{ background: k.gradient }}>
                                    <div className="preview__kpi-label">{k.label}</div>
                                    <div className="preview__kpi-value js-counter" data-val={k.value}>0</div>
                                    <div className="preview__kpi-delta">{k.delta} this month</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts side */}
                        <div className="preview__charts">
                            {/* Monthly chart */}
                            <div className="preview__chart-card hover-lift">
                                <div className="preview__chart-title">Monthly Certificate Generation</div>
                                <div className="preview__chart-sub">Tracking the last 6 months</div>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={monthlyData} barSize={28}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                                        <Bar dataKey="certs" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Bottom row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
                                {/* Dept line chart */}
                                <div className="preview__chart-card hover-lift">
                                    <div className="preview__chart-title">Department Breakdown</div>
                                    <div className="preview__chart-sub">&nbsp;</div>
                                    <ResponsiveContainer width="100%" height={120}>
                                        <LineChart data={deptData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="certs" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: '#d946ef', r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Top staff */}
                                <div className="preview__chart-card hover-lift">
                                    <div className="preview__chart-title">Top Staff</div>
                                    <div className="preview__chart-sub">&nbsp;</div>
                                    <div className="preview__staff">
                                        {[
                                            { name: 'Dr. Mehta', count: 124, pct: 90 },
                                            { name: 'Prof. Singh', count: 98, pct: 72 },
                                            { name: 'Dr. Patel', count: 76, pct: 55 },
                                        ].map((s) => (
                                            <div key={s.name} className="preview__staff-row">
                                                <div className="preview__staff-meta">
                                                    <span className="preview__staff-name">{s.name}</span>
                                                    <span className="preview__staff-count">{s.count}</span>
                                                </div>
                                                <div className="preview__staff-track">
                                                    <div
                                                        className="preview__staff-fill"
                                                        data-pct={s.pct}
                                                        style={{ width: '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
