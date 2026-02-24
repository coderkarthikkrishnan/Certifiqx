// netlify/functions/send-certificate-emails.cjs
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

// ── Send email via Brevo (Sendinblue) REST API ────────────────────────────
async function sendEmail({ to_name, to_email, org_name, job_title, cert_id, pdf_url, verify_url }) {
    console.log('--- BREVO DIAGNOSTICS ---')
    const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY
    if (!apiKey) {
        console.error('BREVO FAILED: Missing API Key')
        return false
    }

    const payload = {
        sender: { name: org_name || "Certifiqx", email: "coderkarthik01@gmail.com" },
        to: [{ email: to_email, name: to_name }],
        subject: `Your ${job_title} Certificate from ${org_name}`,
        htmlContent: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Your ${job_title} Certificate from ${org_name}</title>
    <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; background-color: #f1f3f7; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
        @media screen and (max-width: 600px) {
            .email-card { width: 100% !important; border-radius: 0 !important; }
            .hero-cell { padding: 40px 20px 20px 20px !important; }
            .hero-title { font-size: 22px !important; }
            .body-cell { padding: 30px 20px !important; }
            .cta-btn { font-size: 15px !important; padding: 14px !important; }
            .illo-img { width: 75px !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f3f7;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding:40px 20px;">

                <!-- CARD -->
                <table class="email-card" role="presentation" cellspacing="0" cellpadding="0" border="0"
                    style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">

                    <!-- HERO -->
                    <tr>
                        <td class="hero-cell" align="center"
                            style="background:linear-gradient(135deg,#3b5bdb,#4263eb);background-color:#3b5bdb;padding:50px 40px 30px 40px;border-radius:16px 16px 0 0;">

                            <!-- Illustrations: megaphone | 🎓 | rocket -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="left" valign="bottom" width="33%">
                                        <img class="illo-img"
                                            src="https://cdn.jsdelivr.net/gh/coderkarthikkrishnan/Certifiqx@main/public/images/megaphone.png"
                                            alt="Megaphone" width="110"
                                            style="display:block;border:0;outline:none;text-decoration:none;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.3));">
                                    </td>
                                    <td align="center" valign="middle" width="34%">
                                        <p style="margin:0;font-size:52px;line-height:1;">🎓</p>
                                    </td>
                                    <td align="right" valign="bottom" width="33%">
                                        <img class="illo-img"
                                            src="https://cdn.jsdelivr.net/gh/coderkarthikkrishnan/Certifiqx@main/public/images/rocket.png"
                                            alt="Rocket" width="130"
                                            style="display:block;margin-left:auto;border:0;outline:none;text-decoration:none;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.3));">
                                    </td>
                                </tr>
                            </table>

                            <h1 class="hero-title"
                                style="margin:12px 0 0 0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:32px;font-weight:700;color:#ffffff;text-align:center;letter-spacing:-0.5px;">
                                Certificate of Completion
                            </h1>
                            <p style="margin:10px 0 0 0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.9);text-align:center;line-height:1.5;">
                                Issued by <strong style="color:#ffffff;">${org_name}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                        <td class="body-cell" style="padding:40px;background-color:#ffffff;">

                            <!-- Greeting -->
                            <p style="margin:0 0 10px 0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:22px;font-weight:700;color:#212529;text-align:center;">
                                Congratulations, ${to_name}!
                            </p>
                            <p style="margin:0 0 20px 0;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:15px;color:#495057;line-height:1.6;text-align:center;">
                                We are proud to present you with your official certificate for successfully completing:
                            </p>

                            <!-- Course Name Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background:#f8f9fa;border-radius:8px;padding:15px;text-align:center;">
                                        <span style="font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:18px;font-weight:700;color:#3b5bdb;">
                                            ${job_title}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:20px;">
                                <tr>
                                    <td>
                                        <a class="cta-btn" href="${verify_url}" target="_blank"
                                            style="display:block;padding:16px;background:linear-gradient(135deg,#3b5bdb,#4263eb);background-color:#4263eb;color:#ffffff;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;text-align:center;border-radius:8px;">
                                            View &amp; Verify Certificate
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Certificate ID Box -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:15px;">
                                <tr>
                                    <td style="background:#f1f3f7;padding:12px;border-radius:6px;text-align:center;">
                                        <span style="font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:14px;color:#495057;">
                                            Certificate ID: <span style="font-family:monospace;font-weight:600;color:#212529;">${cert_id}</span>
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- PDF Download Link -->
                            <p style="margin:12px 0 0 0;text-align:center;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:14px;color:#495057;">
                                You can also <a href="${pdf_url}" target="_blank" style="color:#4263eb;text-decoration:underline;font-weight:500;">download the PDF directly</a>.
                            </p>

                            <!-- Divider -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr><td style="padding:30px 0 0 0;"><div style="height:1px;background-color:#e9ecef;"></div></td></tr>
                            </table>

                            <!-- Footer -->
                            <p style="margin:20px 0 0 0;text-align:center;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:14px;color:#868e96;font-weight:500;">
                                Powered by Certifiqx
                            </p>
                            <p style="margin:6px 0 0 0;text-align:center;font-family:'Inter','Segoe UI',Arial,sans-serif;font-size:12px;color:#adb5bd;">
                                &copy; ${new Date().getFullYear()} Certifiqx. All rights reserved.
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

        const successText = await res.text()
        console.log(`BREVO SUCCESS for ${to_email} | Status: ${res.status} | Response: ${successText}`)
        return true
    } catch (err) {
        console.error('BREVO FETCH ERROR:', err)
        return false
    }
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    try {
        const token = event.headers.authorization?.split('Bearer ')[1]
        if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

        const db = initFirebase()
        let decoded
        try {
            decoded = await admin.auth().verifyIdToken(token)
        } catch {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }
        }

        const { certificateIds } = JSON.parse(event.body || '{}')
        if (!Array.isArray(certificateIds) || !certificateIds.length) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing or empty certificateIds array' }) }
        }

        // We limit chunking to 10 at a time strictly for Firestore "in" limits and general safety against timeouts
        if (certificateIds.length > 500) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Maximum 500 certificates per bulk email request.' }) }
        }

        let success = 0
        let failed = 0

        // Process in chunks of 50 to respect Firestore 'in' query limits and keep connections stable
        const chunkSize = 50
        for (let i = 0; i < certificateIds.length; i += chunkSize) {
            const chunk = certificateIds.slice(i, i + chunkSize)

            const certsSnap = await db.collection('certificates')
                .where('certId', 'in', chunk)
                .get()

            const promises = certsSnap.docs.map(async (doc) => {
                const data = doc.data()

                // Extra safety check: only let the issuer send emails (or rely on UI limits + firestore rules)
                // We'll proceed if we have a valid PDF and email
                if (!data.pdfUrl || !data.recipientEmail || data.status === 'revoked') {
                    console.log(`Skipping ${doc.id} due to missing data or revocation`)
                    return false
                }

                const appUrl = process.env.VITE_APP_URL || 'https://certifiqx.app'
                const sent = await sendEmail({
                    to_name: data.recipientName,
                    to_email: data.recipientEmail,
                    org_name: data.orgName,
                    job_title: data.jobTitle,
                    cert_id: data.certId,
                    pdf_url: data.pdfUrl,
                    verify_url: `${appUrl}/verify/${data.certId}`
                })

                return sent
            })

            const results = await Promise.all(promises)

            for (const sent of results) {
                if (sent) success++
                else failed++
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success, failed }),
        }
    } catch (error) {
        console.error('Master handler error:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' })
        }
    }
}
