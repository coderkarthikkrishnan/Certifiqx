// netlify/functions/generate-certificates.js
// Generates PDF certificates + QR codes, uploads to Cloudinary, saves to Firestore, sends emails
const admin = require('firebase-admin')
const QRCode = require('qrcode')
const PDFDoc = require('pdfkit')
const cloudinary = require('cloudinary').v2
const { v4: uuidv4 } = require('uuid')
const { Readable } = require('stream')

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

// ── Cloudinary config ──────────────────────────────────────────────────────
function initCloudinary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
}

// ── Upload buffer to Cloudinary ────────────────────────────────────────────
function uploadToCloudinary(buffer, folder, publicId, resourceType = 'auto') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, public_id: publicId, resource_type: resourceType },
            (err, result) => (err ? reject(err) : resolve(result))
        )
        Readable.from(buffer).pipe(stream)
    })
}

// ── Generate QR PNG buffer ─────────────────────────────────────────────────
async function generateQR(certId) {
    const url = `${process.env.VITE_APP_URL || 'https://certifypro.app'}/verify/${certId}`
    return QRCode.toBuffer(url, { type: 'png', width: 200, margin: 1, color: { dark: '#1e1e2e' } })
}

// ── Generate PDF ───────────────────────────────────────────────────────────
async function generatePDF(data) {
    const { recipientName, jobTitle, orgName, certId, issuedDate, qrImageUrl } = data
    return new Promise((resolve, reject) => {
        const chunks = []
        const doc = new PDFDoc({ size: 'A4', layout: 'landscape', margin: 50 })

        doc.on('data', (c) => chunks.push(c))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        const W = doc.page.width
        const H = doc.page.height

        // Background
        doc.rect(0, 0, W, H).fill('#f8f9fb')
        doc.rect(0, 0, W, 8).fill('#6366f1')               // top accent bar
        doc.rect(0, H - 8, W, 8).fill('#d946ef')           // bottom accent bar

        // Border frame
        doc.rect(24, 24, W - 48, H - 48)
            .lineWidth(2)
            .strokeColor('#e8eaf0')
            .stroke()

        // Title
        doc.font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#6366f1')
            .text('CERTIFICATE OF COMPLETION', 0, 60, { align: 'center' })

        // Org name
        doc.fontSize(9).fillColor('#9ca3af')
            .text(orgName.toUpperCase(), 0, 80, { align: 'center' })

        // Decorative line
        doc.moveTo(W / 2 - 120, 100).lineTo(W / 2 + 120, 100)
            .lineWidth(1).strokeColor('#e8eaf0').stroke()

        // "This certifies that"
        doc.font('Helvetica')
            .fontSize(10)
            .fillColor('#6b7280')
            .text('This certifies that', 0, 118, { align: 'center' })

        // Recipient name
        doc.font('Helvetica-Bold')
            .fontSize(36)
            .fillColor('#1e1e2e')
            .text(recipientName, 0, 140, { align: 'center' })

        // Job title
        doc.font('Helvetica')
            .fontSize(12)
            .fillColor('#6b7280')
            .text(`has successfully completed`, 0, 192, { align: 'center' })

        doc.font('Helvetica-Bold')
            .fontSize(18)
            .fillColor('#6366f1')
            .text(jobTitle, 0, 212, { align: 'center' })

        // Issue date and cert ID
        doc.font('Helvetica')
            .fontSize(9)
            .fillColor('#9ca3af')
            .text(`Issued: ${issuedDate}   ·   Certificate ID: ${certId}`, 0, H - 70, { align: 'center' })

        // Signature line
        doc.moveTo(W / 2 - 80, H - 90).lineTo(W / 2 + 80, H - 90)
            .lineWidth(1).strokeColor('#e8eaf0').stroke()
        doc.font('Helvetica').fontSize(9).fillColor('#9ca3af')
            .text('Authorized Signature', 0, H - 85, { align: 'center' })

        // QR placeholder note (actual QR URL on page)
        doc.font('Helvetica').fontSize(7).fillColor('#9ca3af')
            .text(`Verify at: certifypro.app/verify/${certId}`, W - 200, H - 50, { width: 150, align: 'right' })

        doc.end()
    })
}

// ── Send email via EmailJS REST ────────────────────────────────────────────
async function sendEmail({ to_name, to_email, org_name, job_title, cert_id, pdf_url, verify_url }) {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            template_params: { to_name, to_email, org_name, job_title, cert_id, pdf_url, verify_url },
        }),
    })
    return res.ok
}

// ── Main handler ───────────────────────────────────────────────────────────
exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

    // Verify Firebase ID token
    const token = event.headers.authorization?.split('Bearer ')[1]
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    const db = initFirebase()
    initCloudinary()

    let decoded
    try {
        decoded = await admin.auth().verifyIdToken(token)
    } catch {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }
    }

    // Role check
    const userDoc = await db.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists || userDoc.data().role !== 'staff') {
        return { statusCode: 403, body: JSON.stringify({ error: 'Only staff can generate certificates' }) }
    }

    const { orgId, jobTitle, recipients } = JSON.parse(event.body || '{}')
    if (!orgId || !jobTitle || !Array.isArray(recipients) || !recipients.length) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
    }

    // Subscription limit check
    const subDoc = await db.collection('subscriptions').doc(orgId).get()
    const planLimits = { free: 200, pro: 5000, enterprise: Infinity }
    const plan = subDoc.exists ? (subDoc.data().plan || 'free') : 'free'
    const limit = planLimits[plan]
    const now = new Date()
    const startM = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthSnap = await db.collection('certificates')
        .where('orgId', '==', orgId)
        .where('issuedAt', '>=', admin.firestore.Timestamp.fromDate(startM))
        .get()
    if (monthSnap.size + recipients.length > limit) {
        return { statusCode: 403, body: JSON.stringify({ error: `Plan limit exceeded. Used: ${monthSnap.size}/${limit}` }) }
    }

    // Org details
    const orgDoc = await db.collection('organizations').doc(orgId).get()
    const orgName = orgDoc.exists ? orgDoc.data().name : 'Organization'

    let success = 0, failed = 0
    const issuedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

    for (const row of recipients) {
        const { name, email } = row
        if (!name || !email) { failed++; continue }

        try {
            const certId = uuidv4()
            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

            // 1. Generate QR
            const qrBuffer = await generateQR(certId)
            const qrUpload = await uploadToCloudinary(qrBuffer, `certifypro/${orgId}/qr`, certId + '-qr', 'image')

            // 2. Generate PDF
            const pdfBuffer = await generatePDF({ recipientName: name, jobTitle, orgName, certId, issuedDate, qrImageUrl: qrUpload.secure_url })
            const pdfUpload = await uploadToCloudinary(pdfBuffer, `certifypro/${orgId}/certs`, certId + '-cert', 'auto')

            // 3. Save to Firestore
            await db.collection('certificates').doc(certId).set({
                certId,
                orgId,
                recipientName: name,
                recipientEmail: email,
                recipientSlug: slug,
                jobTitle,
                orgName,
                status: 'valid',
                qrUrl: qrUpload.secure_url,
                pdfUrl: pdfUpload.secure_url,
                issuedBy: decoded.uid,
                issuedByName: userDoc.data().name,
                dept: userDoc.data().dept,
                issuedAt: admin.firestore.FieldValue.serverTimestamp(),
            })

            // 4. Send email
            const appUrl = process.env.VITE_APP_URL || 'https://certifypro.app'
            await sendEmail({
                to_name: name,
                to_email: email,
                org_name: orgName,
                job_title: jobTitle,
                cert_id: certId,
                pdf_url: pdfUpload.secure_url,
                verify_url: `${appUrl}/verify/${certId}`,
            })

            success++
        } catch (err) {
            console.error('Error for', email, err)
            failed++
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ success, failed }),
    }
}
