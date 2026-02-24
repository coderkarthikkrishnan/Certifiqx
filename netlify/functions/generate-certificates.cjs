// netlify/functions/generate-certificates.js
// Generates PDF certificates with custom templates, uploads to Cloudinary, saves to Firestore, sends emails
const admin = require('firebase-admin')
const QRCode = require('qrcode')
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const fontkit = require('@pdf-lib/fontkit')
const cloudinary = require('cloudinary').v2
const { v4: uuidv4 } = require('uuid')
const { Readable } = require('stream')

// ── Firebase Admin init (lazy) ─────────────────────────────────────────────
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
        const options = { folder, public_id: publicId, resource_type: resourceType }

        const stream = cloudinary.uploader.upload_stream(
            options,
            (err, result) => (err ? reject(err) : resolve(result))
        )
        Readable.from(buffer).pipe(stream)
    })
}

// ── Fetch Google Font TTF Buffer ───────────────────────────────────────────
async function fetchGoogleFont(family, weight = 'regular') {
    try {
        // Step 1: Request CSS from Google Fonts (spoofing a user-agent to force TTF/WOFF)
        const familyUrl = family.replace(/\s+/g, '+');
        const weightParam = weight === 'bold' ? '700' : '400';
        const cssUrl = `https://fonts.googleapis.com/css2?family=${familyUrl}:wght@${weightParam}&display=swap`;

        const cssRes = await fetch(cssUrl, {
            headers: {
                // Older Android user-agent often forces raw TTF instead of WOFF2 in Google Fonts API
                'User-Agent': 'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30'
            }
        })

        if (!cssRes.ok) return null;
        const cssText = await cssRes.text();

        // Step 2: Extract the TTF URL from the CSS
        const urlMatch = cssText.match(/url\((https:\/\/[^)]+\.ttf)\)/);
        if (!urlMatch || !urlMatch[1]) return null;

        const fontUrl = urlMatch[1];

        // Step 3: Download the actual TTF buffer
        const fontRes = await fetch(fontUrl);
        if (!fontRes.ok) return null;

        const arrayBuffer = await fontRes.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error('Failed to fetch font', family, err);
        return null;
    }
}

// ── Generate QR PNG buffer ─────────────────────────────────────────────────
async function generateQR(certId) {
    const url = `${process.env.VITE_APP_URL || 'https://certifiqx.app'}/verify/${certId}`
    return QRCode.toBuffer(url, { type: 'png', width: 200, margin: 1, color: { dark: '#1e1e2e' } })
}

// ── Generate PDF ───────────────────────────────────────────────────────────
async function generatePDF({ templateData, recipientName, jobTitle, certId, qrBuffer, row }) {
    try {
        const doc = await PDFDocument.create()
        doc.registerFontkit(fontkit)

        // A4 Landscape: 841.89 x 595.28 points
        const page = doc.addPage([841.89, 595.28])
        const { width: W, height: H } = page.getSize()

        // 1. Draw Background Image
        if (templateData.backgroundUrl) {
            const imgRes = await fetch(templateData.backgroundUrl)
            const imgArrayBuffer = await imgRes.arrayBuffer()
            const bytes = new Uint8Array(imgArrayBuffer)

            let img
            // 0x89 0x50 0x4E 0x47 is PNG magic number
            if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
                img = await doc.embedPng(imgArrayBuffer)
            } else {
                img = await doc.embedJpg(imgArrayBuffer)
            }
            // Stretch the background to fully cover the A4 canvas, identically matching the frontend bounds
            page.drawImage(img, { x: 0, y: 0, width: W, height: H })
        }

        // 2. Pre-fetch and Register Custom Fonts
        const customFonts = {}
        for (const key of Object.keys(templateData.fields)) {
            const field = templateData.fields[key]
            if (field && field.enabled && field.font) {
                const fontFamily = field.font.replace('-Bold', '')
                const isBold = field.isBold
                const fontId = `${fontFamily}${isBold ? '-Bold' : ''}`

                if (!customFonts[fontId]) {
                    // Inject standard fonts natively without network
                    if (fontFamily === 'Helvetica') {
                        customFonts[fontId] = await doc.embedFont(isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica)
                    } else if (fontFamily === 'Times-Roman') {
                        customFonts[fontId] = await doc.embedFont(isBold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman)
                    } else if (fontFamily === 'Courier') {
                        customFonts[fontId] = await doc.embedFont(isBold ? StandardFonts.CourierBold : StandardFonts.Courier)
                    } else {
                        // Custom Google Fonts
                        const fontBuffer = await fetchGoogleFont(fontFamily, isBold ? 'bold' : 'regular')
                        if (fontBuffer) {
                            try {
                                const customFont = await doc.embedFont(fontBuffer)
                                customFonts[fontId] = customFont
                            } catch (e) {
                                console.error('Error embedding font:', fontId, e)
                            }
                        }
                    }
                }
            }
        }

        // Helper: Convert hex to RGB for pdf-lib
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#000000')
            return result ? rgb(
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
            ) : rgb(0, 0, 0)
        }

        // 3. Map Dynamic Fields
        const renderField = async (fieldKey, dynamicReplacements) => {
            const field = templateData.fields[fieldKey]
            if (!field || !field.enabled) return

            let fontFamily = field.font || 'Helvetica'
            let isBold = field.isBold
            let fontId = `${fontFamily}${isBold ? '-Bold' : ''}`

            let font = customFonts[fontId]

            // Fallback to native Helvetica if custom font failed to load
            if (!font) {
                font = await doc.embedFont(isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica)
            }

            const fontSize = Number(field.size) || 12
            const color = hexToRgb(field.color)

            const defaultTexts = {
                recipientName: '{name}',
                jobTitle: '{title}',
                certId: 'Certificate ID: {id}',
                verifyUrl: 'Verify at: {url}'
            }

            let textStr = field.text || defaultTexts[fieldKey] || ''
            for (const [key, value] of Object.entries(dynamicReplacements)) {
                textStr = textStr.replace(key, value)
            }

            // Calculate text width for alignment
            const textWidth = font.widthOfTextAtSize(textStr, fontSize)
            let xPos = Number(field.x) || 0

            if (field.align === 'center') {
                xPos = xPos + (Number(field.w || W) / 2) - (textWidth / 2)
            } else if (field.align === 'right') {
                xPos = xPos + Number(field.w || W) - textWidth
            }

            // pdf-lib y coordinates start from BOTTOM.
            // React Rnd top-left 'y' means the *top* edge of the text box is 'y' pixels down from the top.
            // The baseline is roughly descender-height above the bottom.
            // To align accurately:
            // Top of page = H. Desired top of text = H - field.y.
            // pdf-lib draws from the baseline, which is fontSize points below the top (roughly).
            const yPos = H - (field.y || 0) - (fontSize * 0.8) // 0.8 is an approximate ascender ratio

            page.drawText(textStr, {
                x: xPos,
                y: yPos,
                size: fontSize,
                font: font,
                color: color,
            })
        }

        const appUrl = process.env.VITE_APP_URL || 'certifiqx.app'
        const verifyUrlStr = `${appUrl.replace('https://', '')}/verify/${certId}`
        const replacements = {
            '{name}': recipientName,
            '{title}': jobTitle,
            '{id}': certId,
            '{url}': verifyUrlStr
        }

        if (row) {
            for (const [key, value] of Object.entries(row)) {
                if (key !== 'name' && key !== 'email') {
                    replacements[`{${key}}`] = value || ''
                }
            }
        }

        for (const fieldKey of Object.keys(templateData.fields)) {
            if (fieldKey !== 'qrCode') {
                await renderField(fieldKey, replacements)
            }
        }

        // 4. Render QR Code
        const qrField = templateData.fields.qrCode
        if (qrField && qrField.enabled && qrBuffer) {
            const qrImage = await doc.embedPng(qrBuffer)
            // React Rnd (frontend): y is distance from TOP edge to TOP of QR image
            // pdf-lib: y is distance from BOTTOM edge to BOTTOM of QR image
            const qrSize = Number(qrField.size) || 100
            const yPos = H - Number(qrField.y || 0) - qrSize
            page.drawImage(qrImage, {
                x: Number(qrField.x || 0),
                y: yPos,
                width: qrSize,
                height: qrSize
            })
        }

        const pdfBytes = await doc.save()
        return Buffer.from(pdfBytes)
    } catch (err) {
        throw err
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
        initCloudinary()

        let decoded
        try {
            decoded = await admin.auth().verifyIdToken(token)
        } catch {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }
        }

        // Role check
        const userDoc = await db.collection('users').doc(decoded.uid).get()
        if (!userDoc.exists || userDoc.data().role !== 'STAFF') {
            return { statusCode: 403, body: JSON.stringify({ error: 'Only staff can generate certificates' }) }
        }

        const { orgId, jobTitle, recipients, templateId } = JSON.parse(event.body || '{}')
        if (!orgId || !jobTitle || !templateId || !Array.isArray(recipients) || !recipients.length) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
        }

        // Fetch Template
        const templateDoc = await db.collection('templates').doc(templateId).get()
        if (!templateDoc.exists) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Template not found' }) }
        }
        const templateData = templateDoc.data()

        // Subscription limit check
        const subDoc = await db.collection('subscriptions').doc(orgId).get()
        const planLimits = { free: 200, pro: 5000, enterprise: Infinity }
        const plan = subDoc.exists ? (subDoc.data().plan || 'free') : 'free'
        const limit = planLimits[plan]
        const now = new Date()
        const startM = new Date(now.getFullYear(), now.getMonth(), 1)

        // Create query bound accurately for size retrieval without needing a composite index
        const monthSnap = await db.collection('certificates')
            .where('orgId', '==', orgId)
            .get()

        let monthCount = 0
        monthSnap.forEach(doc => {
            const data = doc.data()
            if (data.issuedAt && data.issuedAt.toDate() >= startM) {
                monthCount++
            }
        })

        if (monthCount + recipients.length > limit) {
            return { statusCode: 403, body: JSON.stringify({ error: `Plan limit exceeded. Used: ${monthCount}/${limit}` }) }
        }

        // Org details
        const orgDoc = await db.collection('organizations').doc(orgId).get()
        const orgName = orgDoc.exists ? orgDoc.data().name : 'Organization'

        // Department details
        let departmentName = null
        const staffDeptId = userDoc.data().departmentId || userDoc.data().dept
        if (staffDeptId) {
            const deptDoc = await db.collection('departments').doc(staffDeptId).get()
            if (deptDoc.exists) departmentName = deptDoc.data().name
        }

        let success = 0, failed = 0
        const issuedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

        for (const row of recipients) {
            const { name, email } = row
            if (!name || !email) { failed++; continue }

            try {
                const certId = uuidv4()
                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

                // 1. Generate QR (and upload)
                let qrBuffer = null
                let qrUrl = null
                if (templateData.fields.qrCode && templateData.fields.qrCode.enabled) {
                    qrBuffer = await generateQR(certId)
                    const qrUpload = await uploadToCloudinary(qrBuffer, `certifiqx/${orgId}/qr`, certId + '-qr', 'image')
                    qrUrl = qrUpload.secure_url
                }

                // 2. Generate PDF using dynamic template
                const pdfBuffer = await generatePDF({ templateData, recipientName: name, jobTitle, certId, qrBuffer, row })
                // Upload natively as 'raw'. Cloudinary Security setting "Strict delivery" must be disabled for this to work without 401.
                // We exclusively use 'raw' with a '.pdf' extension in publicId to prevent Cloudinary from appending double extensions like '.pdf.pdf'
                const pdfUpload = await uploadToCloudinary(pdfBuffer, `certifiqx/${orgId}/certs`, `${certId}-cert.pdf`, 'raw')

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
                    qrUrl: qrUrl || null,
                    pdfUrl: pdfUpload.secure_url,
                    issuedBy: decoded.uid,
                    createdBy: decoded.uid, // Add this for frontend query compatibility
                    issuedByName: userDoc.data().name,
                    templateId, // store the template tied to this cert
                    dept: departmentName || staffDeptId || null,
                    departmentId: staffDeptId || null, // Add this for frontend query compatibility
                    issuedAt: admin.firestore.FieldValue.serverTimestamp(),
                })



                success++
            } catch (err) {
                console.error(`=== ERROR FOR ${email} ===`)
                console.error(err)
                if (err.response) console.error("Response:", err.response.data || err.response.statusText)
                failed++
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
