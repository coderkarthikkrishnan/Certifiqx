import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import './ContactSection.css'

export default function ContactSection() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const form = e.target
        const formData = new FormData(form)

        try {
            const data = Object.fromEntries(formData.entries())
            const response = await fetch("https://formsubmit.co/ajax/gskarthikkrishnan@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success('Message submitted successfully!')
                form.reset()
            } else {
                toast.error('Failed to send message. Please try again later.')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section id="contact" className="contact">
            <Toaster position="bottom-center" />
            <div className="container">
                <div className="contact__header">
                    <h2 className="contact__title">
                        Get in <span className="gradient-text">Touch</span>
                    </h2>
                    <p className="contact__desc">
                        Have questions or need support? We'd love to hear from you.
                    </p>
                </div>
                <form
                    className="contact__form"
                    onSubmit={handleSubmit}
                >
                    <input type="hidden" name="_subject" value="New Contact Form Submission - Certifiqx" />
                    <input type="hidden" name="_captcha" value="false" />

                    <div className="contact__form-row">
                        <div className="contact__form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" name="name" required placeholder="John Doe" />
                        </div>
                        <div className="contact__form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" required placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="contact__form-group">
                        <label htmlFor="message">Message</label>
                        <textarea id="message" name="message" required rows="5" placeholder="How can we help you?"></textarea>
                    </div>

                    <button type="submit" className="contact__submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </section>
    )
}
