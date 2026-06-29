import Navbar from '@/components/Navbar'
import DevelopHero from '@/components/develop/DevelopHero'
import DevelopFeatures from '@/components/develop/DevelopFeatures'
import DevelopTimeline from '@/components/develop/DevelopTimeline'
import ReliabilitySection from '@/components/develop/ReliabilitySection'
import SiteFooter from '@/components/property/SiteFooter'

export const metadata = {
  title: 'Develop Property — My World City',
  description:
    'From legal clearances to the final Vastu check, My World City orchestrates every professional and permit to turn your land into a masterpiece.',
}

const navLinks = [
  { label: 'Find Property', href: '/find-property' },
  { label: 'Build Property', href: '/develop' },
  { label: 'Services', href: '/services' },
  { label: 'Premium', href: '#' },
]

export default function DevelopPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar links={navLinks} cta="brand" />
      <DevelopHero />
      <DevelopFeatures />
      <DevelopTimeline />
      <ReliabilitySection />
      <SiteFooter />
    </main>
  )
}
