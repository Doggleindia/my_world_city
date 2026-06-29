import Navbar from '@/components/Navbar'
import ServicesHero from '@/components/services/ServicesHero'
import ServiceHub from '@/components/services/ServiceHub'
import ConciergeCTA from '@/components/services/ConciergeCTA'
import ChatFab from '@/components/services/ChatFab'
import SiteFooter from '@/components/property/SiteFooter'

export const metadata = {
  title: 'Services — My World City',
  description:
    'From search to possession, handled. Browse My World City’s verified service partners — legal, surveyor, architect, contractor and more across Jaipur.',
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-indigo-50 text-slate-900">
      <Navbar cta="brand" />
      <ServicesHero />
      <ServiceHub />
      <ConciergeCTA />
      <SiteFooter />
      <ChatFab />
    </main>
  )
}
