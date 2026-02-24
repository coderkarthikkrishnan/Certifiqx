import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import UserAvatar from '../../components/UserAvatar'
import { User, Mail, Shield, Building2, Calendar, Edit3, Key } from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import './ProfilePage.css'

const roleLabels = {
    PLATFORM_SUPER_ADMIN: 'Super Admin',
    PRINCIPAL: 'Principal',
    HOD: 'Head of Department',
    STAFF: 'Staff',
}

export default function ProfilePage() {
    const { currentUser, role } = useAuth()
    const [isEditing, setIsEditing] = useState(false)

    // Derived info
    const joinDate = currentUser?.metadata?.creationTime
        ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : 'Unknown'

    return (
        <DashboardLayout>
            <div className="dash-header">
                <div className="dash-header__left">
                    <h1 className="dash-header__title">My Profile</h1>
                    <p className="dash-header__subtitle">View and manage your account details</p>
                </div>
            </div>

            <div className="profile-container">
                <motion.div
                    className="profile-card profile-card--main"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="profile-cover"></div>
                    <div className="profile-header">
                        <div className="profile-avatar-wrapper">
                            <UserAvatar
                                photoURL={currentUser?.photoURL}
                                name={currentUser?.displayName || 'User'}
                                size={120}
                                className="profile-avatar-img"
                            />
                            <button className="profile-avatar-edit">
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <div className="profile-header-info">
                            <h2 className="profile-name">{currentUser?.displayName || 'No Name Set'}</h2>
                            <p className="profile-email">{currentUser?.email}</p>
                            <span className={`profile-badge profile-badge--${role?.toLowerCase()}`}>
                                {roleLabels[role] || role}
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="profile-grid">
                    <motion.div
                        className="profile-card profile-card--info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <h3 className="profile-card-title">Personal Information</h3>
                        <div className="profile-info-list">
                            <div className="profile-info-item">
                                <div className="profile-info-icon"><User size={18} /></div>
                                <div className="profile-info-content">
                                    <span className="profile-info-label">Full Name</span>
                                    <span className="profile-info-value">{currentUser?.displayName || 'Not specified'}</span>
                                </div>
                            </div>
                            <div className="profile-info-item">
                                <div className="profile-info-icon"><Mail size={18} /></div>
                                <div className="profile-info-content">
                                    <span className="profile-info-label">Email Address</span>
                                    <span className="profile-info-value">{currentUser?.email}</span>
                                </div>
                            </div>
                            <div className="profile-info-item">
                                <div className="profile-info-icon"><Calendar size={18} /></div>
                                <div className="profile-info-content">
                                    <span className="profile-info-label">Joined</span>
                                    <span className="profile-info-value">{joinDate}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </DashboardLayout>
    )
}
