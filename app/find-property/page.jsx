import Navbar from '@/components/Navbar'
import Gallery from '@/components/Gallery'
import FilterChipsBar from '@/components/listing/FilterChipsBar'
import FilterSidebar from '@/components/listing/FilterSidebar'
import ListingCarousel from '@/components/listing/ListingCarousel'
import { listings, activeChips } from '@/data'

export const metadata = {
  title: 'Find Property — My World City',
  description: 'Browse verified residential, commercial and industrial properties across Jaipur.',
}

const navLinks = [
  { label: 'Find Property', href: '/find-property' },
  { label: 'Build Property', href: '/develop' },
  { label: 'Services', href: '/services' },
  { label: 'Premium', href: '#' },
]

export default function FindPropertyPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar links={navLinks} cta="brand" />
      <FilterChipsBar initial={activeChips} />

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <div className="flex flex-col gap-7 lg:flex-row">
          {/* Filters */}
          <aside className="lg:w-[280px] lg:shrink-0">
            <FilterSidebar />
          </aside>

          {/* Listings */}
          <div className="min-w-0 flex-1">
            <nav className="mb-6 flex items-center gap-1.5 text-[13px] text-slate-500">
              <span>Buy or Rent</span>
              <span className="text-slate-400">›</span>
              <span>Residential</span>
              <span className="text-slate-400">›</span>
              <span className="font-semibold text-navy-800">All localities</span>
            </nav>

            <div className="space-y-14">
              <ListingCarousel title="Featured in Jaipur" items={listings} />
              <ListingCarousel title="Newly Listed" items={listings} />
              <ListingCarousel title="Top Picks in Budget" items={listings} />
            </div>
          </div>
        </div>
      </div>

      <Gallery bg="bg-slate-100" />
    </main>
  )
}
