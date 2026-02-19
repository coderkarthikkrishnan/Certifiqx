import Navbar from '../../components/Navbar'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import DashboardPreviewSection from './DashboardPreviewSection'
import PricingSection from './PricingSection'
import Footer from './Footer'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans overflow-x-hidden">
            <Navbar />
            <main>
                <HeroSection />
                <FeaturesSection />
                <DashboardPreviewSection />
                <PricingSection />
            </main>
            <Footer />
        </div>
    )
}
