// src/pages/Auth/UnauthorizedPage.jsx
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../firebase/auth'
import './UnauthorizedPage.css'

export default function UnauthorizedPage() {
    const { role } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        navigate('/login', { replace: true })
    }

    return (
        <div className="unauth-page">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="unauth-card"
            >
                <div className="unauth-card__icon"><ShieldOff /></div>
                <h1 className="unauth-card__title">Access Denied</h1>
                <p className="unauth-card__sub">You don&apos;t have permission to view this page.</p>
                {role && (
                    <p className="unauth-card__role">
                        Your role: <code>{role}</code>
                    </p>
                )}
                <div className="unauth-card__actions">
                    <button onClick={() => navigate(-1)} className="unauth-btn--outline">Go back</button>
                    <button onClick={handleLogout} className="unauth-btn--fill">Sign Out</button>
                </div>
            </motion.div>
        </div>
    )
}
