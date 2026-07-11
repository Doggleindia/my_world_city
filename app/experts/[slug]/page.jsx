import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import ProfileHero from '@/components/experts/ProfileHero'
import ProfileAbout from '@/components/experts/ProfileAbout'
import ProfileSkills from '@/components/experts/ProfileSkills'
import ProfileShowcase from '@/components/experts/ProfileShowcase'
import SiteFooter from '@/components/property/SiteFooter'
import { getExpertProfile, allExpertSlugs } from '@/lib/experts'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await allExpertSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getExpertProfile(slug)
  if (!p) return { title: 'Expert not found — My World City' }
  return { title: `${p.name} — My World City`, description: p.intro }
}

export default async function ExpertProfilePage({ params }) {
  const { slug } = await params
  const p = await getExpertProfile(slug)
  if (!p) notFound()

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <TopBar />
      <Navbar cta="brand" />
      <ProfileHero p={p} />
      <ProfileAbout p={p} />
      <ProfileSkills p={p} />
      <ProfileShowcase p={p} />
      <SiteFooter />
    </main>
  )
}
