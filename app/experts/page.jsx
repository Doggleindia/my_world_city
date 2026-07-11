import Navbar from '@/components/Navbar'
import ExpertStepper from '@/components/experts/ExpertStepper'
import ExpertDirectory from '@/components/experts/ExpertDirectory'
import SiteFooter from '@/components/property/SiteFooter'
import { getPublicExperts } from '@/lib/experts'
import { expertCategories } from '@/data'

export const metadata = {
  title: 'Connect with our Experts — My World City',
  description:
    'Trusted professionals for every step of buying, building and owning property in the Pink City.',
}

export const revalidate = 60

export default async function ExpertsPage() {
  const experts = await getPublicExperts()
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[44px]">
          Connect with our experts
        </h1>
        <p className="mt-3 text-[15px] text-slate-600 sm:text-[16px]">
          Trusted professionals for every step of buying, building and owning property in the Pink
          City.
        </p>

        <ExpertStepper />
        <ExpertDirectory experts={experts} categories={expertCategories} />
      </div>

      <SiteFooter />
    </main>
  )
}
