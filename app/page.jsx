import TopBar from '@/components/TopBar'
import ScrollBackdrop from '@/components/ScrollBackdrop'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Reveal from '@/components/Reveal'
import ActionSelector from '@/components/ActionSelector'
import WhyJoinUs from '@/components/WhyJoinUs'
import Stats from '@/components/Stats'
import BrowseByCategory from '@/components/BrowseByCategory'
import FeaturedProperties from '@/components/FeaturedProperties'
import TalkToExpert from '@/components/TalkToExpert'
import Gallery from '@/components/Gallery'
import Insights from '@/components/Insights'
import BottomCTA from '@/components/BottomCTA'
import Footer from '@/components/Footer'

// Revalidate so DB-backed Featured properties stay fresh in production.
export const revalidate = 60

export default function Home() {
  return (
    <main className="relative min-h-screen text-slate-900">
      <ScrollBackdrop />
      <TopBar />
      {/* The bar sits transparent over the hero video, then pins to the top of
          the window as a solid bar once the user scrolls. */}
      <div className="relative">
        <Navbar overlay />
        <Hero />
      </div>

      <Reveal stagger><ActionSelector /></Reveal>
      <Reveal><WhyJoinUs /></Reveal>
      <Reveal><Stats /></Reveal>
      <Reveal stagger><BrowseByCategory /></Reveal>
      <Reveal stagger><FeaturedProperties /></Reveal>
      <Reveal><TalkToExpert /></Reveal>
      <Reveal><Gallery /></Reveal>
      <Reveal><Insights /></Reveal>
      <Reveal><BottomCTA /></Reveal>
      <Footer />
    </main>
  )
}
