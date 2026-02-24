const fetch = require('node-fetch');
require('dotenv').config();

async function sendEmail() {
    try {
        console.log('Sending to EmailJS API with vars:');
        console.log('Service:', process.env.VITE_EMAILJS_SERVICE_ID);
        console.log('Template:', process.env.VITE_EMAILJS_TEMPLATE_ID);

        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: process.env.VITE_EMAILJS_SERVICE_ID,
                template_id: process.env.VITE_EMAILJS_TEMPLATE_ID,
                user_id: process.env.VITE_EMAILJS_PUBLIC_KEY,
                template_params: {
                    to_name: 'Test Setup',
                    to_email: 'coderkarthik01@gmail.com',
                    org_name: 'Test Org',
                    job_title: 'Email Fix Tester',
                    cert_id: 'test-1234',
                    pdf_url: 'https://certifiqx.app',
                    verify_url: 'https://certifiqx.app'
                },
            }),
        });

        console.log('Status:', res.status, res.statusText);
        const text = await res.text();
        console.log('Response body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

sendEmail().then(() => { });
