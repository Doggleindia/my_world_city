import Navbar from '@/components/Navbar'
import SavedProperties from '@/components/saved/SavedProperties'
import SiteFooter from '@/components/property/SiteFooter'

export const metadata = {
  title: 'Saved Properties — My World City',
  description: 'Your shortlisted properties on My World City.',
}

const navLinks = [
  { label: 'Find Property', href: '/find-property' },
  { label: 'Develop Property', href: '/develop' },
  { label: 'Services', href: '/services' },
  { label: 'Premium', href: '#' },
]

export default function SavedPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <Navbar links={navLinks} cta="brand" />
      <div className="flex-1">
        <SavedProperties />
      </div>
      <SiteFooter />
    </main>
  )
}
