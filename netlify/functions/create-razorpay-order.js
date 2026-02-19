// netlify/functions/create-razorpay-order.js
// Creates a Razorpay order for subscription upgrade
const Razorpay = require('razorpay')
const admin = require('firebase-admin')

function initFirebase() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        })
    }
    return admin.firestore()
}

const PLAN_PRICES = {
    pro: 199900, // ₹1999 in paise
    enterprise: 0,      // custom — handled manually
}

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

    const { orgId, plan } = JSON.parse(event.body || '{}')
    if (!orgId || !plan) return { statusCode: 400, body: JSON.stringify({ error: 'Missing orgId or plan' }) }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const amount = PLAN_PRICES[plan]
    if (amount === undefined) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid plan' }) }

    const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `rcpt_${orgId.slice(0, 10)}_${Date.now()}`,
        notes: { orgId, planKey: `plan_${plan}`, userId: decoded.uid },
    })

    return {
        statusCode: 200,
        body: JSON.stringify({ orderId: order.id, amount: order.amount, currency: order.currency }),
    }
}
