// netlify/functions/send-invite.cjs
const admin = require('firebase-admin')

// ── Firebase Admin init (lazy) ─────────────────────────────────────────────
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

// ── Send email via Brevo REST API ──────────────────────────────────────────
async function sendInviteEmail({ email, orgName, inviterName, role, appUrl }) {
    console.log('--- BREVO INVITE DIAGNOSTICS ---')
    const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY
    if (!apiKey) {
        console.error('BREVO FAILED: Missing API Key')
        return false
    }

    const payload = {
        sender: { name: orgName || "Certifiqx", email: "coderkarthik01@gmail.com" }, // Verified sender
        to: [{ email: email }],
        subject: `You have been invited to join ${orgName} on Certifiqx`,
        htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; max-width: 600px; width: 100%;">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-color: #4F46E5; padding: 40px 20px;">
                                        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Invitation to Certifiqx</h1>
                                        <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 16px;">${orgName}</p>
                                    </td>
                                </tr>
                                
                                <!-- Body -->
                                <tr>
                                    <td align="center" style="padding: 40px 40px 30px 40px;">
                                        <h2 style="color: #111827; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">Hello there!</h2>
                                        <p style="color: #4B5563; margin: 0 0 10px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                            You have been invited by <strong>${inviterName}</strong> to join their organization as a <strong>${role}</strong>.
                                        </p>
                                        <p style="color: #4B5563; margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; text-align: center;">
                                            By accepting this invitation, you will be able to manage and issue certificates securely within the organization.
                                        </p>
                                        
                                        <!-- Call to Action -->
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="background-color: #4F46E5; border-radius: 8px;">
                                                    <a href="${appUrl}/login" target="_blank" style="font-size: 16px; font-weight: bold; color: #FFFFFF; text-decoration: none; padding: 16px 32px; display: inline-block; border-radius: 8px;">Accept Invitation & Login</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Divider -->
                                <tr>
                                    <td align="center" style="padding: 0 40px;">
                                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 0;">
                                    </td>
                                </tr>
                                
                                <!-- Footer info -->
                                <tr>
                                    <td align="center" style="padding: 30px 40px 40px 40px;">
                                        <p style="color: #6B7280; margin: 0 0 20px 0; font-size: 14px;">If you do not have an account, you will be prompted to create one with this exact email address.</p>
                                        
                                        <p style="color: #D1D5DB; margin: 0; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Powered by Certifiqx</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    }

    try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('BREVO FAILED:', res.status, errText)
            return false
        }
        console.log('BREVO SUCCESS')
        return true
    } catch (err) {
        console.error('BREVO FETCH ERROR:', err)
        return false
    }
}

// ── Main handler ───────────────────────────────────────────────────────────
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    try {
        // Verify Firebase ID token
        const token = event.headers.authorization?.split('Bearer ')[1]
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

        const db = initFirebase()

        let decoded
        try {
            decoded = await admin.auth().verifyIdToken(token)
        } catch {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }
        }

        const { targetEmail, role, orgId } = JSON.parse(event.body)
        if (!targetEmail || !role || !orgId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing parameters' }) }
        }

        // Get the inviter's user details
        const inviterSnap = await db.collection('users').doc(decoded.uid).get()
        if (!inviterSnap.exists) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Inviter not found' }) }
        }

        let orgName = 'Your Organization'
        if (orgId !== 'global') {
            const orgSnap = await db.collection('organizations').doc(orgId).get()
            if (orgSnap.exists) {
                orgName = orgSnap.data().name
            }
        } else {
            orgName = 'Certifiqx Global'
        }

        const appUrl = process.env.VITE_APP_URL || 'https://certifiqx.app'

        // Send email
        const emailSent = await sendInviteEmail({
            email: targetEmail.toLowerCase(),
            orgName,
            inviterName: inviterSnap.data().name || inviterSnap.data().displayName || decoded.email,
            role,
            appUrl
        })

        if (!emailSent) {
            return { statusCode: 500, body: JSON.stringify({ error: 'Failed to dispatch email via Brevo' }) }
        }

        return { statusCode: 200, body: JSON.stringify({ success: true }) }

    } catch (error) {
        console.error('Fatal Invitation Error:', error)
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Internal Server Error' }) }
    }
}
