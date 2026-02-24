// netlify/functions/revoke-certificate.js
// Allows Principal or SuperAdmin to revoke a certificate
const admin = require('firebase-admin')

function initFirebase() {
    if (!admin.apps.length) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            privateKey = privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '').replace(/^'|'$/g, '');
            const beginKey = '-----BEGIN PRIVATE KEY-----';
            const endKey = '-----END PRIVATE KEY-----';
            if (privateKey.includes(beginKey) && privateKey.includes(endKey)) {
                let keyBody = privateKey.replace(beginKey, '').replace(endKey, '').replace(/\s+/g, '');
                privateKey = `${beginKey}\n${keyBody}\n${endKey}`;
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        })
    }
    return admin.firestore()
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    const token = event.headers.authorization?.split('Bearer ')[1]
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    const db = initFirebase()

    let decoded
    try {
        decoded = await admin.auth().verifyIdToken(token)
    } catch {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }
    }

    const userDoc = await db.collection('users').doc(decoded.uid).get()
    const role = userDoc.data()?.role
    if (!['principal', 'superadmin'].includes(role)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Only Principal or Super Admin can revoke certificates' }) }
    }

    const { certId } = JSON.parse(event.body || '{}')
    if (!certId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing certId' }) }

    await db.collection('certificates').doc(certId).update({
        status: 'revoked',
        revokedBy: decoded.uid,
        revokedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { statusCode: 200, body: JSON.stringify({ success: true }) }
}
