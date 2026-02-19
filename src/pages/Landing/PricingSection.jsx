import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Building2, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const plans = [
    {
        name: 'Starter',
        icon: Shield,
        price: '₹0',
        period: '/month',
        desc: 'Perfect for small organizations just getting started.',
        limit: '200 certificates/month',
        color: 'from-gray-100 to-gray-50',
        border: 'border-gray-200',
        btn: 'Get Started Free',
        btnCls: 'border border-gray-300 text-gray-700 hover:border-brand-300 hover:text-brand-600',
        featured: false,
        features: [
            '200 certificates/month',
            'QR code verification',
            'Public achievement page',
            'Email delivery',
            'Basic analytics',
            '1 department',
        ],
    },
    {
        name: 'Pro',
        icon: Zap,
        price: '₹1,999',
        period: '/month',
        desc: 'For growing institutions that need more power.',
        limit: '5,000 certificates/month',
        color: 'from-brand-600 to-accent-600',
        border: '',
        btn: 'Start Pro Trial',
        btnCls: 'bg-white text-brand-700 hover:bg-brand-50 font-bold',
        featured: true,
        features: [
            '5,000 certificates/month',
            'Custom certificate design',
            'LinkedIn sharing',
            'Priority email support',
            'Advanced analytics',
            'Unlimited departments',
            'Bulk CSV generation',
            'Revocation system',
        ],
    },
    {
        name: 'Enterprise',
        icon: Building2,
        price: 'Custom',
        period: '',
        desc: 'Unlimited scale for large universities and enterprises.',
        limit: 'Unlimited certificates',
        color: 'from-gray-800 to-gray-900',
        border: 'border-gray-700',
        btn: 'Contact Sales',
        btnCls: 'bg-white text-gray-900 hover:bg-gray-100 font-bold',
        featured: false,
        features: [
            'Unlimited certificates',
            'Custom branding & domain',
            'SSO integration',
            'Dedicated account manager',
            'SLA guarantee',
            'Multi-org management',
            'API access',
            'Custom integrations',
        ],
    },
]

export default function PricingSection() {
    const [annual, setAnnual] = useState(false)

    return (
        <section id="pricing" className="py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold mb-4">
                        💳 Simple Pricing
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                        Start free,{' '}
                        <span className="gradient-text">scale as you grow</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
                        No hidden fees. Cancel anytime. Switch plans instantly.
                    </p>

                    {/* Toggle */}
                    <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full p-1">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${annual ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                        >
                            Annual <span className="text-green-600 font-bold ml-1">−20%</span>
                        </button>
                    </div>
                </motion.div>

                {/* Cards */}
                <div className="grid lg:grid-cols-3 gap-6 items-stretch">
                    {plans.map((plan, i) => {
                        const Icon = plan.icon
                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`relative rounded-3xl overflow-hidden flex flex-col ${plan.featured
                                        ? 'shadow-glow scale-105'
                                        : 'shadow-card border ' + plan.border
                                    }`}
                            >
                                {plan.featured && (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.color}`} />
                                )}
                                {!plan.featured && (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.color}`} />
                                )}

                                {plan.featured && (
                                    <div className="relative z-10 text-center py-2 text-white text-xs font-bold tracking-widest uppercase">
                                        ⭐ Most Popular
                                    </div>
                                )}

                                <div className="relative z-10 p-7 flex flex-col flex-1">
                                    {/* Plan name */}
                                    <div className={`flex items-center gap-3 mb-4`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.featured ? 'bg-white/20' : 'bg-white shadow-soft'
                                            }`}>
                                            <Icon className={`w-5 h-5 ${plan.featured ? 'text-white' : 'text-brand-600'}`} />
                                        </div>
                                        <div>
                                            <div className={`text-base font-black ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.name}</div>
                                            <div className={`text-xs ${plan.featured ? 'text-white/70' : 'text-gray-400'}`}>{plan.limit}</div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <span className={`text-4xl font-black ${plan.featured ? 'text-white' : 'text-gray-900'}`}>
                                            {plan.price === 'Custom' ? plan.price : annual && plan.price !== '₹0'
                                                ? `₹${Math.round(parseInt(plan.price.replace(/[^\d]/g, '')) * 0.8).toLocaleString('en-IN')}`
                                                : plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className={`text-sm ml-1 ${plan.featured ? 'text-white/70' : 'text-gray-400'}`}>{plan.period}</span>
                                        )}
                                    </div>

                                    <p className={`text-sm mb-6 leading-relaxed ${plan.featured ? 'text-white/80' : 'text-gray-500'}`}>{plan.desc}</p>

                                    {/* Features */}
                                    <ul className="space-y-2.5 flex-1 mb-7">
                                        {plan.features.map((feat) => (
                                            <li key={feat} className="flex items-start gap-2.5">
                                                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.featured ? 'bg-white/25' : 'bg-green-100'
                                                    }`}>
                                                    <Check className={`w-2.5 h-2.5 ${plan.featured ? 'text-white' : 'text-green-600'}`} />
                                                </div>
                                                <span className={`text-sm ${plan.featured ? 'text-white/90' : 'text-gray-600'}`}>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Button */}
                                    <Link
                                        to="/register"
                                        className={`block text-center py-3.5 rounded-2xl text-sm transition-all ${plan.btnCls}`}
                                    >
                                        {plan.btn}
                                    </Link>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
