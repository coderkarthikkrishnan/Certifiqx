import { Link } from 'react-router-dom'
import { ShieldCheck, Twitter, Linkedin, Github } from 'lucide-react'

const links = {
    Product: ['Features', 'Pricing', 'Dashboard', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    Support: ['Documentation', 'API Reference', 'Status', 'Contact'],
}

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-black text-white text-lg">CertifyPro</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-500 mb-5">
                            Secure digital certificates with instant QR verification for modern institutions.
                        </p>
                        <div className="flex items-center gap-3">
                            {[Twitter, Linkedin, Github].map((Icon, i) => (
                                <button
                                    key={i}
                                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-colors"
                                >
                                    <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Link groups */}
                    {Object.entries(links).map(([group, items]) => (
                        <div key={group}>
                            <div className="text-white text-sm font-bold mb-4">{group}</div>
                            <ul className="space-y-2.5">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-600">
                        © 2025 CertifyPro. All rights reserved. Built with ❤️ for educators.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Secured by Firebase</span>
                        <span>·</span>
                        <span>Hosted on Netlify</span>
                        <span>·</span>
                        <span>Powered by Cloudinary</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
