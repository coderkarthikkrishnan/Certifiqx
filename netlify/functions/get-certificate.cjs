// netlify/functions/get-certificate.js
// Public endpoint — no auth required. Returns certificate data for /verify/:id page.
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
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }

    const certId = event.queryStringParameters?.id
    if (!certId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing certificate ID' }) }

    const db = initFirebase()
    const doc = await db.collection('certificates').doc(certId).get()

    if (!doc.exists) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Certificate not found' }),
        }
    }

    const data = doc.data()
    // Omit sensitive fields
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
            certId: data.certId,
            recipientName: data.recipientName,
            recipientEmail: data.recipientEmail,
            recipientSlug: data.recipientSlug,
            jobTitle: data.jobTitle,
            orgName: data.orgName,
            status: data.status,
            qrUrl: data.qrUrl,
            pdfUrl: data.pdfUrl,
            issuedAt: data.issuedAt?._seconds
                ? new Date(data.issuedAt._seconds * 1000).toISOString()
                : null,
        }),
    }
}
