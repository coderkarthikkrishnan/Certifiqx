import { ReactLenis } from 'lenis/react'
import Navbar from '../../components/Navbar'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import DashboardPreviewSection from './DashboardPreviewSection'
import ContactSection from './ContactSection'
import Footer from './Footer'

export default function LandingPage() {
    return (
        <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothTouch: false }}>
            <div className="min-h-screen bg-[#f8f9fb] font-sans overflow-x-hidden">
                <Navbar />
                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <DashboardPreviewSection />
                    <ContactSection />
                </main>
                <Footer />
            </div>
        </ReactLenis>
    )
}
