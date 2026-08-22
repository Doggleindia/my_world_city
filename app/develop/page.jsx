// import Navbar from '@/components/Navbar'
// import DevelopHero from '@/components/develop/DevelopHero'
// import DevelopFeatures from '@/components/develop/DevelopFeatures'
// import DevelopTimeline from '@/components/develop/DevelopTimeline'
// import ReliabilitySection from '@/components/develop/ReliabilitySection'
// import SiteFooter from '@/components/property/SiteFooter'

// export const metadata = {
//   title: 'Develop Property — My World City',
//   description:
//     'From legal clearances to the final Vastu check, My World City orchestrates every professional and permit to turn your land into a masterpiece.',
// }

// export default function DevelopPage() {
//   return (
//     <main className="min-h-screen bg-white text-slate-900">
//       <Navbar cta="brand" />
//       <DevelopHero />
//       <DevelopFeatures />
//       <DevelopTimeline />
//       <ReliabilitySection />
//       <SiteFooter />
//     </main>
//   )
// }





// app/develop/page.jsx
import Navbar from '@/components/Navbar'
import DevelopHero from '@/components/develop/DevelopHero'
import DevelopFeatures from '@/components/develop/DevelopFeatures'
import DevelopTimeline from '@/components/develop/DevelopTimeline'
import ReliabilitySection from '@/components/develop/ReliabilitySection'
import SiteFooter from '@/components/property/SiteFooter'

export const metadata = {
  title: 'Develop Property — My World City',
  description:
    'Developing a property in Jaipur? My World City handles the whole process, step by step, with verified experts.',
}

export default function DevelopPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />
      <DevelopHero />
      <DevelopFeatures />
      <DevelopTimeline />
      <ReliabilitySection />
      <SiteFooter />
    </main>
  )
}