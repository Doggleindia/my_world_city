import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6 text-center text-slate-900">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-[64px] font-extrabold leading-none text-navy-900">404</h1>
      <p className="mt-2 text-[16px] text-slate-500">We couldn’t find that page.</p>
      <div className="mt-7 flex gap-3">
        <Link href="/" className="rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-navy-700">
          Go home
        </Link>
        <Link href="/find-property" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400">
          Browse properties
        </Link>
      </div>
    </main>
  )
}
