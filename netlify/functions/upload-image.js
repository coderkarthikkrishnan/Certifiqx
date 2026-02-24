const admin = require('firebase-admin')
const cloudinary = require('cloudinary').v2
const { v4: uuidv4 } = require('uuid')

function initFirebase() {
    if (!admin.apps.length) {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            privateKey = privateKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        })
    }
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    const token = event.headers.authorization?.split('Bearer ')[1]
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    initFirebase()

    let decoded
    try {
        decoded = await admin.auth().verifyIdToken(token)
    } catch {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }
    }

    try {
        const body = JSON.parse(event.body)
        const { imageBase64, orgId } = body

        if (!imageBase64 || !orgId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing imageBase64 or orgId' }) }
        }

        const id = uuidv4()
        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
            folder: `certifiqx/${orgId}/templates`,
            public_id: id,
            resource_type: 'image'
        })

        return {
            statusCode: 200,
            body: JSON.stringify({ url: uploadResponse.secure_url })
        }
    } catch (err) {
        console.error(err)
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to upload image' }) }
    }
}
