require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
});

const db = admin.firestore();

async function checkKarthik() {
    const users = await db.collection('users').where('email', '==', 'coderkarthik01@gmail.com').get();
    if (users.empty) {
        console.log('User not found');
        return;
    }
    const karthik = users.docs[0];
    console.log('USER DATA:', JSON.stringify(karthik.data(), null, 2));

    const certs = await db.collection('certificates').where('createdBy', '==', karthik.id).get();
    console.log('GENERATED CERTS COUNT:', certs.size);
    if (certs.size > 0) {
        console.log('SAMPLE CERT:', JSON.stringify(certs.docs[0].data(), null, 2));
    }
}

checkKarthik().then(() => process.exit(0)).catch(console.error);
