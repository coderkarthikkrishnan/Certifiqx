// netlify/functions/razorpay-webhook.js
// Handles Razorpay subscription webhooks to update org plan in Firestore
const crypto = require('crypto')
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

const PLAN_META = {
    'plan_free': { plan: 'free', monthlyLimit: 200 },
    'plan_pro': { plan: 'pro', monthlyLimit: 5000 },
    'plan_enterprise': { plan: 'enterprise', monthlyLimit: Infinity },
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    const signature = event.headers['x-razorpay-signature']
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Verify HMAC signature
    const expectedSig = crypto.createHmac('sha256', secret).update(event.body).digest('hex')
    if (signature !== expectedSig) {
        console.error('Invalid Razorpay webhook signature')
        return { statusCode: 400, body: 'Invalid signature' }
    }

    const db = initFirebase()
    const payload = JSON.parse(event.body)
    const event_ = payload.event

    try {
        if (event_ === 'payment.captured') {
            const payment = payload.payload.payment.entity
            const notes = payment.notes || {}
            const orgId = notes.orgId
            const planKey = notes.planKey || 'plan_pro'
            const meta = PLAN_META[planKey] || PLAN_META['plan_pro']

            if (orgId) {
                await db.collection('subscriptions').doc(orgId).set({
                    plan: meta.plan,
                    monthlyLimit: meta.monthlyLimit,
                    razorpayPaymentId: payment.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true })

                await db.collection('organizations').doc(orgId).update({ plan: meta.plan })
                console.log(`Upgraded org ${orgId} to ${meta.plan}`)
            }
        }

        if (event_ === 'subscription.cancelled') {
            const sub = payload.payload.subscription.entity
            const orgId = sub.notes?.orgId
            if (orgId) {
                await db.collection('subscriptions').doc(orgId).set({
                    plan: 'free',
                    monthlyLimit: 200,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true })
                await db.collection('organizations').doc(orgId).update({ plan: 'free' })
                console.log(`Downgraded org ${orgId} to free`)
            }
        }

        return { statusCode: 200, body: 'OK' }
    } catch (err) {
        console.error('Webhook error:', err)
        return { statusCode: 500, body: 'Internal error' }
    }
}
