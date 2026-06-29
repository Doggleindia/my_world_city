import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import ProfileHero from '@/components/experts/ProfileHero'
import ProfileAbout from '@/components/experts/ProfileAbout'
import ProfileSkills from '@/components/experts/ProfileSkills'
import ProfileShowcase from '@/components/experts/ProfileShowcase'
import SiteFooter from '@/components/property/SiteFooter'
import { expertList, expertContentByCat, expertProfileFallback } from '@/data'

const TITLES = ['Ar.', 'Adv.', 'Er.', 'Dr.', 'Mr.', 'Ms.', 'Mrs.', 'Pandit']
const firstNameOf = (name) => {
  const parts = name.split(' ')
  return TITLES.includes(parts[0]) ? parts[1] : parts[0]
}

// Build a profile: category-appropriate content with the matched expert's identity overlaid.
function buildProfile(slug) {
  const match = expertList.find((e) => e.slug === slug) ?? expertList[0]
  const content = expertContentByCat[match.cat] ?? expertProfileFallback
  return {
    ...content,
    slug: match.slug,
    name: match.name,
    role: match.role,
    cat: match.cat,
    tag: match.tag,
    initials: match.initials,
    specialty: match.specialty,
    firstName: firstNameOf(match.name),
  }
}

export function generateStaticParams() {
  return expertList.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = buildProfile(slug)
  return {
    title: `${p.name} — My World City`,
    description: p.intro,
  }
}

export default async function ExpertProfilePage({ params }) {
  const { slug } = await params
  const p = buildProfile(slug)

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
