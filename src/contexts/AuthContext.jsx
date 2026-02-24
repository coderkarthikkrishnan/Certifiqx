// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseConfig'
import { signOut } from '../firebase/auth'

/**
 * Valid roles — must match Firestore exactly.
 */
export const ROLES = {
    SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
    PRINCIPAL: 'PRINCIPAL',
    HOD: 'HOD',
    STAFF: 'STAFF',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [role, setRole] = useState(null)
    const [orgId, setOrgId] = useState(null)
    const [departmentId, setDepartmentId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authError, setAuthError] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setAuthError(null)

            if (!firebaseUser) {
                // Signed out — clear everything
                setCurrentUser(null)
                setRole(null)
                setOrgId(null)
                setDepartmentId(null)
                setLoading(false)
                return
            }

            try {
                // Fetch Firestore user document (single source of truth for role)
                const userRef = doc(db, 'users', firebaseUser.uid)
                const userSnap = await getDoc(userRef)

                if (!userSnap.exists()) {
                    // Check if there is a pending invitation
                    const email = firebaseUser.email
                    if (email) {
                        const invRef = doc(db, 'invitations', email)
                        const invSnap = await getDoc(invRef)
                        if (invSnap.exists()) {
                            const invData = invSnap.data()
                            if (invData.status === 'pending') {
                                // Consume invitation and create user profile
                                await setDoc(userRef, {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    name: firebaseUser.displayName || 'New User',
                                    photoURL: firebaseUser.photoURL || null,
                                    role: invData.role,
                                    orgId: invData.orgId,
                                    departmentId: invData.departmentId || invData.dept || null,
                                    status: 'ACTIVE',
                                    createdAt: new Date()
                                })
                                // Delete the invitation
                                await deleteDoc(invRef)

                                // Fetch the newly created profile to continue standard flow
                                const newUserSnap = await getDoc(userRef)
                                const data = newUserSnap.data()
                                setCurrentUser({
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    displayName: firebaseUser.displayName,
                                    photoURL: firebaseUser.photoURL,
                                })
                                setRole(data.role)
                                setOrgId(data.orgId || null)
                                setDepartmentId(data.departmentId || data.dept || null)
                                setLoading(false)
                                return
                            }
                        }
                    }

                    // Firebase auth succeeded but no Firestore document & no invitation — deny access
                    setAuthError('no_firestore_doc')
                    await signOut()         // force sign-out — access denied
                    setCurrentUser(null)
                    setRole(null)
                    setOrgId(null)
                    setDepartmentId(null)
                    setLoading(false)
                    return
                }

                const data = userSnap.data()
                const validRoles = Object.values(ROLES)

                if (!validRoles.includes(data.role)) {
                    // Unknown / invalid role in Firestore — deny access
                    setAuthError('invalid_role')
                    await signOut()
                    setCurrentUser(null)
                    setRole(null)
                    setOrgId(null)
                    setDepartmentId(null)
                    setLoading(false)
                    return
                }

                // Check if the organization is suspended (skip for super admins who don't have an org necessarily or manage everything)
                if (data.orgId && data.role !== ROLES.SUPER_ADMIN) {
                    const orgRef = doc(db, 'organizations', data.orgId)
                    const orgSnap = await getDoc(orgRef)
                    if (orgSnap.exists() && orgSnap.data().suspended) {
                        setAuthError('org_suspended')
                        await signOut()
                        setCurrentUser(null)
                        setRole(null)
                        setOrgId(null)
                        setDepartmentId(null)
                        setLoading(false)
                        return
                    }
                }

                // All checks passed — set user state
                setCurrentUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                })
                setRole(data.role)
                setOrgId(data.orgId || null)
                setDepartmentId(data.departmentId || data.dept || null)
                setLoading(false)

            } catch (err) {
                console.error('AuthContext: Firestore fetch failed', err)
                setAuthError('firestore_error')
                setCurrentUser(null)
                setRole(null)
                setLoading(false)
            }
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        role,
        orgId,
        departmentId,
        loading,
        authError,
        isAuthenticated: !!currentUser,
        isSuperAdmin: role === ROLES.SUPER_ADMIN,
        isPrincipal: role === ROLES.PRINCIPAL,
        isHOD: role === ROLES.HOD,
        isStaff: role === ROLES.STAFF,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
