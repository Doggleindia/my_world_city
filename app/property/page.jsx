import { ChevronRight } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyDetails from '@/components/property/PropertyDetails'
import ContactCard from '@/components/property/ContactCard'
import OwnershipSteps from '@/components/property/OwnershipSteps'
import SiteFooter from '@/components/property/SiteFooter'
import { property, ownershipSteps } from '@/data'

export const metadata = {
  title: `${property.title} — My World City`,
  description: property.about,
}

export default function PropertyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <TopBar />
      <Navbar cta="brand" />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
          {property.breadcrumb.map((c, i) => {
            const last = i === property.breadcrumb.length - 1
            return (
              <span key={c} className="flex items-center gap-1.5">
                <span className={last ? 'font-semibold text-navy-800' : ''}>{c}</span>
                {!last && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
              </span>
            )
          })}
        </nav>

        <PropertyGallery
          gallery={property.gallery}
          verified={property.verified}
          photoCount={property.photoCount}
        />

        {/* Body */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <PropertyDetails property={property} />
          <ContactCard property={property} />
        </div>
      </div>

      <OwnershipSteps steps={ownershipSteps} />
      <SiteFooter />
    </main>
  )
}
