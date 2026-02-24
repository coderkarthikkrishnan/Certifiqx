import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer-single-line">
            <div className="container footer-single-line__inner">
                <div className="footer-single-line__brand">
                    <ShieldCheck size={20} className="text-brand" />
                    <span className="font-bold text-white">Certifiqx</span>
                </div>
                <div className="footer-single-line__copy">
                    © 2025 Certifiqx. All rights reserved. Built with ❤️ for educators.
                </div>
            </div>
        </footer>
    )
}
