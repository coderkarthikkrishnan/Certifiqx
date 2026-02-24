import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Building2, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import './PricingSection.css'

const plans = [
    {
        name: 'Starter', icon: Shield,
        price: '₹0', period: '/month',
        desc: 'Perfect for small organizations just getting started.',
        limit: '200 certificates/month',
        variant: 'default',
        btn: 'Get Started Free', btnCls: 'pricing__cta--ghost',
        featured: false,
        features: ['200 certificates/month', 'QR code verification', 'Public achievement page', 'Email delivery', 'Basic analytics', '1 department'],
    },
    {
        name: 'Pro', icon: Zap,
        price: '₹1,999', period: '/month',
        desc: 'For growing institutions that need more power.',
        limit: '5,000 certificates/month',
        variant: 'featured',
        btn: 'Start Pro Trial', btnCls: 'pricing__cta--white',
        featured: true,
        features: ['5,000 certificates/month', 'Custom certificate design', 'LinkedIn sharing', 'Priority email support', 'Advanced analytics', 'Unlimited departments', 'Bulk CSV generation', 'Revocation system'],
    },
    {
        name: 'Enterprise', icon: Building2,
        price: 'Custom', period: '',
        desc: 'Unlimited scale for large universities and enterprises.',
        limit: 'Unlimited certificates',
        variant: 'dark',
        btn: 'Contact Sales', btnCls: 'pricing__cta--dark',
        featured: false,
        features: ['Unlimited certificates', 'Custom branding & domain', 'SSO integration', 'Dedicated account manager', 'SLA guarantee', 'Multi-org management', 'API access', 'Custom integrations'],
    },
]

export default function PricingSection() {
    const [annual, setAnnual] = useState(false)

    return (
        <section id="pricing" className="pricing">
            <div className="container">
                <div className="pricing__header">
                    <div className="pricing__badge">💳 Simple Pricing</div>
                    <h2 className="pricing__title">
                        Start free, <span className="gradient-text">scale as you grow</span>
                    </h2>
                    <p className="pricing__sub">No hidden fees. Cancel anytime. Switch plans instantly.</p>
                    <div className="pricing__toggle">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`pricing__toggle-btn${!annual ? ' pricing__toggle-btn--active' : ''}`}
                        >Monthly</button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`pricing__toggle-btn${annual ? ' pricing__toggle-btn--active' : ''}`}
                        >Annual <span className="pricing__toggle-save">−20%</span></button>
                    </div>
                </div>

                <div className="pricing__cards">
                    {plans.map((plan, i) => {
                        const Icon = plan.icon
                        const v = plan.variant
                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`pricing__card pricing__card--${v}`}
                            >
                                {plan.featured && (
                                    <div className="pricing__popular-tag">⭐ Most Popular</div>
                                )}
                                <div className="pricing__body">
                                    <div className="pricing__plan-header">
                                        <div className={`pricing__plan-icon pricing__plan-icon--${plan.featured ? 'featured' : 'light'}`}>
                                            <Icon />
                                        </div>
                                        <div>
                                            <div className={`pricing__plan-name pricing__plan-name--${v}`}>{plan.name}</div>
                                            <div className={`pricing__plan-limit pricing__plan-limit--${v}`}>{plan.limit}</div>
                                        </div>
                                    </div>

                                    <div className="pricing__price">
                                        <span className={`pricing__price-amount pricing__price-amount--${v}`}>
                                            {plan.price === 'Custom' ? plan.price
                                                : annual && plan.price !== '₹0'
                                                    ? `₹${Math.round(parseInt(plan.price.replace(/[^\d]/g, '')) * 0.8).toLocaleString('en-IN')}`
                                                    : plan.price}
                                        </span>
                                        {plan.period && <span className={`pricing__price-period pricing__price-period--${v}`}>{plan.period}</span>}
                                    </div>

                                    <p className={`pricing__desc pricing__desc--${v}`}>{plan.desc}</p>

                                    <ul className="pricing__features">
                                        {plan.features.map((feat) => (
                                            <li key={feat} className="pricing__feature">
                                                <div className={`pricing__feature-check pricing__feature-check--${plan.featured ? 'featured' : 'light'}`}>
                                                    <Check />
                                                </div>
                                                <span className={`pricing__feature-text pricing__feature-text--${v}`}>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/register" className={`pricing__cta ${plan.btnCls}`}>{plan.btn}</Link>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
