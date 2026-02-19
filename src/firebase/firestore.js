import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    serverTimestamp,
    addDoc,
    onSnapshot,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// ── Users ──────────────────────────────────────────────────────────────────
export const getUserProfile = (uid) =>
    getDoc(doc(db, 'users', uid))

export const createUserProfile = (uid, data) =>
    setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() })

export const updateUserProfile = (uid, data) =>
    updateDoc(doc(db, 'users', uid), data)

// ── Organizations ──────────────────────────────────────────────────────────
export const getOrganization = (orgId) =>
    getDoc(doc(db, 'organizations', orgId))

export const createOrganization = (orgId, data) =>
    setDoc(doc(db, 'organizations', orgId), { ...data, createdAt: serverTimestamp() })

export const updateOrganization = (orgId, data) =>
    updateDoc(doc(db, 'organizations', orgId), data)

export const getAllOrganizations = () =>
    getDocs(collection(db, 'organizations'))

// ── Certificates ───────────────────────────────────────────────────────────
export const getCertificate = (certId) =>
    getDoc(doc(db, 'certificates', certId))

export const getCertificatesByOrg = (orgId) =>
    getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId),
        orderBy('issuedAt', 'desc')
    ))

export const getCertificatesByEmail = (email) =>
    getDocs(query(
        collection(db, 'certificates'),
        where('recipientEmail', '==', email),
        orderBy('issuedAt', 'desc')
    ))

export const getCertificatesBySlug = (slug) =>
    getDocs(query(
        collection(db, 'certificates'),
        where('recipientSlug', '==', slug),
        orderBy('issuedAt', 'desc')
    ))

export const revokeCertificate = (certId) =>
    updateDoc(doc(db, 'certificates', certId), { status: 'revoked', revokedAt: serverTimestamp() })

// ── Subscriptions ──────────────────────────────────────────────────────────
export const getSubscription = (orgId) =>
    getDoc(doc(db, 'subscriptions', orgId))

export const updateSubscription = (orgId, data) =>
    setDoc(doc(db, 'subscriptions', orgId), { ...data, updatedAt: serverTimestamp() }, { merge: true })

// ── Monthly Usage ──────────────────────────────────────────────────────────
export const getMonthlyUsage = async (orgId) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId),
        where('issuedAt', '>=', startOfMonth)
    ))
    return snap.size
}

// ── Departments ────────────────────────────────────────────────────────────
export const getDepartmentsByOrg = (orgId) =>
    getDocs(query(collection(db, 'departments'), where('orgId', '==', orgId)))

export const createDepartment = (data) =>
    addDoc(collection(db, 'departments'), { ...data, createdAt: serverTimestamp() })
