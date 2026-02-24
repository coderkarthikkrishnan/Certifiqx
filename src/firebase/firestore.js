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

export const getAllUsers = () =>
    getDocs(collection(db, 'users'))

export const getUsersByOrg = (orgId) =>
    getDocs(query(collection(db, 'users'), where('orgId', '==', orgId)))

export const getUsersByDept = async (orgId, deptId) => {
    const snap = await getDocs(query(
        collection(db, 'users'),
        where('orgId', '==', orgId)
    ))
    const filteredDocs = snap.docs.filter(d => {
        const data = d.data()
        return data.departmentId === deptId || data.dept === deptId
    })
    return { docs: filteredDocs }
}

// ── Invitations ────────────────────────────────────────────────────────────
export const getInvitation = (email) =>
    getDoc(doc(db, 'invitations', email))

export const createInvitation = (email, data) =>
    setDoc(doc(db, 'invitations', email), { ...data, createdAt: serverTimestamp() })

export const deleteInvitation = (email) =>
    deleteDoc(doc(db, 'invitations', email))

export const getInvitationsByOrg = (orgId) =>
    getDocs(query(collection(db, 'invitations'), where('orgId', '==', orgId)))

export const getInvitationsByDept = async (orgId, deptId) => {
    const snap = await getDocs(query(
        collection(db, 'invitations'),
        where('orgId', '==', orgId)
    ))
    const filteredDocs = snap.docs.filter(d => {
        const data = d.data()
        return data.departmentId === deptId || data.dept === deptId
    })
    return { docs: filteredDocs }
}

// ── Organizations ──────────────────────────────────────────────────────────
export const getOrganization = (orgId) =>
    getDoc(doc(db, 'organizations', orgId))

export const createOrganization = (orgId, data) =>
    setDoc(doc(db, 'organizations', orgId), { ...data, createdAt: serverTimestamp() })

export const updateOrganization = (orgId, data) =>
    updateDoc(doc(db, 'organizations', orgId), data)

export const deleteOrganization = (orgId) =>
    deleteDoc(doc(db, 'organizations', orgId))

export const getAllOrganizations = () =>
    getDocs(collection(db, 'organizations'))

// ── Certificates ───────────────────────────────────────────────────────────
export const getCertificate = (certId) =>
    getDoc(doc(db, 'certificates', certId))

export const getCertificatesByOrg = async (orgId) => {
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId)
    ))
    return { docs: snap.docs.sort((a, b) => (b.data().issuedAt?.toMillis() || 0) - (a.data().issuedAt?.toMillis() || 0)) }
}

export const getCertificatesByDept = async (orgId, deptId) => {
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId)
    ))
    const filtered = snap.docs.filter(d => {
        const data = d.data()
        return data.departmentId === deptId || data.dept === deptId
    })
    return { docs: filtered.sort((a, b) => (b.data().issuedAt?.toMillis() || 0) - (a.data().issuedAt?.toMillis() || 0)) }
}

export const getCertificatesByStaff = async (orgId, deptId, uid) => {
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId),
        where('createdBy', '==', uid)
    ))
    return { docs: snap.docs.sort((a, b) => (b.data().issuedAt?.toMillis() || 0) - (a.data().issuedAt?.toMillis() || 0)) }
}

export const getCertificatesByEmail = async (email) => {
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('recipientEmail', '==', email)
    ))
    return { docs: snap.docs.sort((a, b) => (b.data().issuedAt?.toMillis() || 0) - (a.data().issuedAt?.toMillis() || 0)) }
}

export const getAllCertificates = async () => {
    const snap = await getDocs(query(collection(db, 'certificates'), limit(100)))
    return { docs: snap.docs.sort((a, b) => (b.data().issuedAt?.toMillis() || 0) - (a.data().issuedAt?.toMillis() || 0)) }
}

export const getCertificatesBySlug = async (slug) => {
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('recipientSlug', '==', slug)
    ))
    return { docs: snap.docs.sort((a, b) => (b.data().issuedAt?.toMillis() || 0) - (a.data().issuedAt?.toMillis() || 0)) }
}

export const revokeCertificate = (certId) =>
    updateDoc(doc(db, 'certificates', certId), { status: 'revoked', revokedAt: serverTimestamp() })

export const deleteCertificate = (certId) =>
    deleteDoc(doc(db, 'certificates', certId))

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
        where('orgId', '==', orgId)
    ))
    let count = 0
    snap.forEach(doc => {
        const data = doc.data()
        if (data.issuedAt && data.issuedAt.toDate() >= startOfMonth) count++
    })
    return count
}

export const getMonthlyUsageByDept = async (orgId, deptId) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId)
    ))
    let count = 0
    snap.forEach(doc => {
        const data = doc.data()
        if ((data.departmentId === deptId || data.dept === deptId) && data.issuedAt && data.issuedAt.toDate() >= startOfMonth) count++
    })
    return count
}

export const getMonthlyUsageByStaff = async (orgId, deptId, uid) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const snap = await getDocs(query(
        collection(db, 'certificates'),
        where('orgId', '==', orgId),
        where('createdBy', '==', uid)
    ))
    let count = 0
    snap.forEach(doc => {
        const data = doc.data()
        if (data.issuedAt && data.issuedAt.toDate() >= startOfMonth) count++
    })
    return count
}

// ── Departments ────────────────────────────────────────────────────────────
export const getDepartmentsByOrg = (orgId) =>
    getDocs(query(collection(db, 'departments'), where('orgId', '==', orgId)))

export const getDepartmentById = (deptId) =>
    getDoc(doc(db, 'departments', deptId))

export const createDepartment = (data) =>
    addDoc(collection(db, 'departments'), { ...data, createdAt: serverTimestamp() })

// ── Templates ──────────────────────────────────────────────────────────────
export const getOrgTemplates = (orgId) =>
    getDocs(query(collection(db, 'templates'), where('orgId', '==', orgId)))

export const getDepartmentTemplates = (orgId, deptId) =>
    getDocs(query(collection(db, 'templates'), where('orgId', '==', orgId), where('departmentId', '==', deptId)))

export const getApprovedTemplates = async (orgId, deptId) => {
    // 1. Fetch ALL templates for this org (to avoid missing composite index errors)
    const orgSnap = await getDocs(query(
        collection(db, 'templates'),
        where('orgId', '==', orgId)
    ))

    // 2. Filter in memory to handle missing/null/empty departmentId variations cleanly
    const docs = []
    orgSnap.forEach(doc => {
        const data = doc.data()
        // Only include approved
        if (data.status !== 'APPROVED') return

        // It's a global template if there's no departmentId
        const isGlobal = !data.departmentId
        // It's our department's template
        const isOurs = data.departmentId === deptId

        if (isGlobal || isOurs) {
            docs.push(doc)
        }
    })

    return docs
}

export const getTemplateById = async (id) => {
    const d = await getDoc(doc(db, 'templates', id))
    return d.exists() ? { id: d.id, ...d.data() } : null
}

export const createTemplate = (id, data) =>
    setDoc(doc(db, 'templates', id), { ...data, createdAt: serverTimestamp() })

export const updateTemplateStatus = (id, status) =>
    updateDoc(doc(db, 'templates', id), { status })

export const deleteTemplate = (id) =>
    deleteDoc(doc(db, 'templates', id))
