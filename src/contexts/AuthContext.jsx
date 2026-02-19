import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebaseConfig'
import { getUserProfile } from '../firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)
                try {
                    const snap = await getUserProfile(firebaseUser.uid)
                    if (snap.exists()) {
                        setUserProfile(snap.data())
                    } else {
                        setUserProfile(null)
                    }
                } catch {
                    setUserProfile(null)
                }
            } else {
                setUser(null)
                setUserProfile(null)
            }
            setLoading(false)
        })
        return unsub
    }, [])

    const role = userProfile?.role || null
    const orgId = userProfile?.orgId || null
    const plan = userProfile?.plan || 'free'

    return (
        <AuthContext.Provider value={{ user, userProfile, role, orgId, plan, loading, setUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
