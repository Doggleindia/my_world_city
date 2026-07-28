import Link from 'next/link'

export default function HeroTabs() {
  return (
    <div className="mt-8 flex w-full max-w-md overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-card">
      <Link
        href="/find-property"
        className="flex-1 text-center rounded-full px-6 py-2.5 text-[14px] font-semibold transition bg-brand text-white hover:opacity-90"
      >
        Find Solution
      </Link>
      <Link
        href="/list-property"
        className="flex-1 text-center rounded-full px-6 py-2.5 text-[14px] font-semibold transition text-slate-600 hover:text-navy-800 hover:bg-slate-50"
      >
        Post Requirement
      </Link>
    </div>
  )
}
