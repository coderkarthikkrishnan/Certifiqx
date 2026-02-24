import { useState, useEffect } from 'react'
import DashboardLayout from './DashboardLayout'
import { getAllUsers } from '../../firebase/firestore'
import { Search, Shield, Building2, Crown, BadgeCheck, Users } from 'lucide-react'

const ROLE_CONFIG = {
    PLATFORM_SUPER_ADMIN: { badgeClass: 'badge badge--danger', icon: Crown, label: 'Super Admin' },
    PRINCIPAL: { badgeClass: 'badge badge--brand', icon: Shield, label: 'Principal' },
    HOD: { badgeClass: 'badge badge--accent', icon: BadgeCheck, label: 'HOD' },
    STAFF: { badgeClass: 'badge badge--success', icon: Users, label: 'Staff' },
}

const USER_AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#06b6d4', '#0ea5e9', '#f59e0b', '#10b981']

export default function SuperAdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        getAllUsers().then(snap => { setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const RoleBadge = ({ role }) => {
        const cfg = ROLE_CONFIG[role] || { badgeClass: 'badge', icon: Users, label: role }
        const Icon = cfg.icon
        return <span className={cfg.badgeClass} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon style={{ width: 11, height: 11 }} /> {cfg.label}</span>
    }

    return (
        <DashboardLayout>
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title">User Directory</h1>
                    <p className="db-page-sub">Cross-organization user management</p>
                </div>
            </div>

            <div className="db-table-wrap">
                {/* Search header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div className="db-search-wrap">
                        <span className="db-search-icon"><Search /></span>
                        <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="db-search-input" />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--c-text-faint)', fontWeight: 600 }}>{filteredUsers.length} users</span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="bouncing-loader"><div></div><div></div><div></div></div></div>
                ) : filteredUsers.length === 0 ? (
                    <div className="db-empty"><p className="db-empty__sub">No users found.</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="db-table">
                            <thead><tr><th>User</th><th>Role</th><th>Organization ID</th></tr></thead>
                            <tbody>
                                {filteredUsers.map((user, i) => {
                                    const avatarColor = USER_AVATAR_COLORS[i % USER_AVATAR_COLORS.length]
                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    {user.photoURL
                                                        ? <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                                                        : <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</div>
                                                    }
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--c-text-primary)' }}>{user.name || 'Unnamed'}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><RoleBadge role={user.role} /></td>
                                            <td>
                                                {user.orgId
                                                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building2 style={{ width: 14, height: 14, color: 'var(--c-text-faint)' }} /><code style={{ fontSize: 11, fontWeight: 600, background: 'var(--c-bg)', padding: '2px 6px', borderRadius: 4, color: 'var(--c-text-secondary)' }}>{user.orgId}</code></div>
                                                    : <span style={{ fontSize: 12, color: 'var(--c-text-faint)', fontStyle: 'italic' }}>Global</span>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
