import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Gallery from '@/components/Gallery'
import FindProperty from '@/components/listing/FindProperty'

export const metadata = {
  title: 'Find Property — My World City',
  description: 'Browse verified residential, commercial and industrial properties across Jaipur.',
}

export default function FindPropertyPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />
      <Suspense fallback={null}>
        <FindProperty />
      </Suspense>
      <Gallery bg="bg-slate-100" />
    </main>
  )
}
