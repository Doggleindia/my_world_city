import { Globe } from 'lucide-react'

const cols = [
  { head: 'Company', items: ['About Us', 'Careers', 'Contact', 'Blog'] },
  { head: 'Properties', items: ['Residential', 'Commercial', 'Industrial', 'Farm & Agri'] },
  { head: 'Services', items: ['Legal', 'Surveyor', 'Architect', 'Vastu'] },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <a href="#" className="flex items-center gap-2 font-extrabold text-white">
            <Globe className="h-5 w-5 text-sky-400" />
            <span className="text-[15px]">My World City</span>
          </a>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-400">
            Jaipur's verified property platform connecting buyers, builders and investors —
            every property real, every partner verified.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.head}>
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-white">{c.head}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="text-[13px] text-slate-400 transition hover:text-white">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12.5px] text-slate-400 sm:flex-row sm:px-6">
          <p>© 2026 My World City. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
