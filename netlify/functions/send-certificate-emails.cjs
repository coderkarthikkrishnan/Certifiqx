// netlify/functions/send-certificate-emails.cjs
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
                const matchedBody = keyBody.match(/.{1,64}/g);
                if (matchedBody) {
                    privateKey = `${beginKey}\n${matchedBody.join('\n')}\n${endKey}\n`;
                }
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

// ── Send email via Brevo (Sendinblue) REST API ────────────────────────────
async function sendEmail({ to_name, to_email, org_name, job_title, cert_id, pdf_url, verify_url }) {
    console.log('--- BREVO DIAGNOSTICS ---')
    const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY
    if (!apiKey) {
        console.error('BREVO FAILED: Missing API Key')
        return false
    }

    const payload = {
        sender: { name: org_name || "Certifiqx", email: "coderkarthik01@gmail.com" }, // Note: Sender email must be verified in Brevo
        to: [{ email: to_email, name: to_name }],
        subject: `Your ${job_title} Certificate from ${org_name}`,
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
                                        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Certificate of Completion</h1>
                                        <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 16px;">Issued by ${org_name}</p>
                                    </td>
                                </tr>
                                
                                <!-- Body -->
                                <tr>
                                    <td align="center" style="padding: 40px 40px 30px 40px;">
                                        <h2 style="color: #111827; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">Congratulations, ${to_name}!</h2>
                                        <p style="color: #4B5563; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                            We are proud to present you with your official certificate for successfully completing:<br>
                                            <strong style="color: #111827; font-size: 18px; display: inline-block; margin-top: 10px;">${job_title}</strong>
                                        </p>
                                        
                                        <!-- Call to Action -->
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="background-color: #4F46E5; border-radius: 8px;">
                                                    <a href="${verify_url}" target="_blank" style="font-size: 16px; font-weight: bold; color: #FFFFFF; text-decoration: none; padding: 16px 32px; display: inline-block; border-radius: 8px;">View & Verify Certificate</a>
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
                                        <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px;"><strong>Certificate ID:</strong> <span style="font-family: monospace; background: #F3F4F6; padding: 2px 6px; border-radius: 4px;">${cert_id}</span></p>
                                        <p style="color: #9CA3AF; margin: 0 0 20px 0; font-size: 14px;">You can also <a href="${pdf_url}" style="color: #4F46E5; text-decoration: underline;">download the PDF directly</a>.</p>
                                        
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
