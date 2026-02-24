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
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>You're Invited to ${orgName}</title>
                <style type="text/css">
                    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    body { margin: 0; padding: 0; background-color: #f1f3f7; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
                    @media screen and (max-width: 600px) {
                        .email-card { width: 100% !important; border-radius: 0 !important; }
                        .hero-cell { padding: 40px 20px !important; }
                        .hero-title { font-size: 28px !important; }
                        .body-cell { padding: 35px 20px 30px 20px !important; }
                        .cta-btn { padding: 14px 20px !important; }
                    }
                </style>
            </head>
            <body style="margin:0;padding:0;background-color:#f1f3f7;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="center" style="padding:40px 20px;">

                            <!-- Card -->
                            <table class="email-card" role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">

                                <!-- ── HERO ── -->
                                <tr>
                                    <td class="hero-cell" align="center" style="background:linear-gradient(135deg,#3b5bdb,#4263eb);background-color:#3b5bdb;padding:60px 40px;border-radius:16px 16px 0 0;">
                                        <h1 class="hero-title" style="margin:0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:42px;font-weight:700;color:#ffffff;letter-spacing:-1px;">.hello there</h1>
                                        <p style="margin:12px 0 0 0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.85);line-height:1.5;">
                                            You've been invited to join <strong style="color:#ffffff;">${orgName}</strong> on Certifiqx.
                                        </p>
                                    </td>
                                </tr>

                                <!-- ── BODY ── -->
                                <tr>
                                    <td class="body-cell" style="padding:50px 40px 40px 40px;background-color:#ffffff;">

                                        <!-- Section title -->
                                        <h2 style="margin:0 0 20px 0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:22px;font-weight:600;color:#212529;text-align:center;">You've got an invitation!</h2>

                                        <!-- Info block -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td valign="top" style="width:20px;color:#4263eb;font-size:20px;line-height:1.5;padding-bottom:14px;">&bull;</td>
                                                <td style="font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:15px;color:#495057;line-height:1.6;padding-bottom:14px;">
                                                    <strong style="color:#212529;">${inviterName}</strong> has invited you to join as a <strong style="color:#212529;">${role}</strong>.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="width:20px;color:#4263eb;font-size:20px;line-height:1.5;padding-bottom:14px;">&bull;</td>
                                                <td style="font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:15px;color:#495057;line-height:1.6;padding-bottom:14px;">
                                                    Once you accept, you'll be able to manage and issue certificates securely within <strong style="color:#212529;">${orgName}</strong>.
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style="width:20px;color:#4263eb;font-size:20px;line-height:1.5;">&bull;</td>
                                                <td style="font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:15px;color:#495057;line-height:1.6;">
                                                    If you don't have an account yet, you'll be prompted to create one using this email address.
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Divider -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr><td style="padding:30px 0;"><div style="height:1px;background-color:#e9ecef;"></div></td></tr>
                                        </table>

                                        <p style="text-align:center;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:15px;color:#495057;margin:0 0 25px 0;">Ready to get started? Click below to accept your invitation.</p>

                                        <!-- CTA Button -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <a class="cta-btn" href="${appUrl}/login" target="_blank"
                                                        style="display:block;background:linear-gradient(135deg,#3b5bdb,#4263eb);background-color:#4263eb;color:#ffffff;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:16px;font-weight:600;text-decoration:none;padding:16px;border-radius:8px;text-align:center;">
                                                        Accept Invitation &amp; Login
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Footer note -->
                                        <p style="text-align:center;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:12px;color:#adb5bd;margin:30px 0 0 0;text-transform:uppercase;letter-spacing:1px;">
                                            Powered by Certifiqx
                                        </p>

                                    </td>
                                </tr>

                            </table>
                            <!-- /Card -->

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
