import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
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
    <main className="min-h-screen bg-white text-slate-900">
      <TopBar />
      <Navbar />
      <Hero />
      <ActionSelector />
      <WhyJoinUs />
      <Stats />
      <BrowseByCategory />
      <FeaturedProperties />
      <TalkToExpert />
      <Gallery />
      <Insights />
      <BottomCTA />
      <Footer />
    </main>
  )
}
