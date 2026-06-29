import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { stats } from '@/data'

export const metadata = {
  title: 'About Us — My World City',
  description: 'My World City is Jaipur’s verified property platform for buyers, builders and investors.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[42px]">
          About My World City
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-slate-600">
          My World City is Jaipur’s verified property platform — built for anyone who wants to buy,
          build, manage or invest in property without the hunt, the doubt or the runaround. We bring
          real listings, trusted professionals and the right approvals together under one roof.
        </p>
        <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
          Every property is real, every partner is verified, and every step is guided — from the
          first search to the final registry. Whether you’re moving in, building from the ground up,
          or putting money to work, the right people and the right properties are already lined up
          for you.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-7 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-[24px] font-extrabold text-brand">{s.value}</div>
              <div className="mt-1 text-[11px] font-semibold tracking-wide text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 id="careers" className="mt-12 scroll-mt-24 text-[22px] font-bold text-navy-800">Careers</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          We’re always looking for people who care about transparency in real estate. Reach out via
          our <a href="/contact" className="font-semibold text-brand hover:underline">contact page</a> with your CV.
        </p>
      </div>
      <SiteFooter />
    </main>
  )
}
