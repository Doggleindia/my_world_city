import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import ProfileHero from '@/components/experts/ProfileHero'
import ProfileAbout from '@/components/experts/ProfileAbout'
import ProfileSkills from '@/components/experts/ProfileSkills'
import ProfileShowcase from '@/components/experts/ProfileShowcase'
import SiteFooter from '@/components/property/SiteFooter'
import { expertProfile, expertList } from '@/data'

const navLinks = [
  { label: 'Find Property', href: '/find-property' },
  { label: 'Build Property', href: '/develop' },
  { label: 'Services', href: '/services' },
  { label: 'Premium', href: '#' },
]

const TITLES = ['Ar.', 'Adv.', 'Er.', 'Dr.', 'Mr.', 'Ms.', 'Mrs.', 'Pandit']
const firstNameOf = (name) => {
  const parts = name.split(' ')
  return TITLES.includes(parts[0]) ? parts[1] : parts[0]
}

// Build a profile: the rich template (Neha) with the matched expert's identity overlaid.
function buildProfile(slug) {
  const match = expertList.find((e) => e.slug === slug)
  if (!match) return expertProfile
  return {
    ...expertProfile,
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
      <Navbar links={navLinks} cta="brand" />
      <ProfileHero p={p} />
      <ProfileAbout p={p} />
      <ProfileSkills p={p} />
      <ProfileShowcase p={p} />
      <SiteFooter />
    </main>
  )
}
