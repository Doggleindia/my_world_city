import Link from 'next/link'
import ExpertConnectButton from './ExpertConnectButton'

export default function ExpertCard({ id, initials, tag, name, role, specialty, slug }) {
  const href = slug ? `/experts/${slug}` : '#'
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={href}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-800 text-[14px] font-bold text-white"
        >
          {initials}
        </Link>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-brand">
          {tag}
        </span>
      </div>

      <Link href={href} className="mt-4 block">
        <h3 className="text-[16px] font-bold text-navy-800 transition hover:text-brand">{name}</h3>
      </Link>
      <p className="mt-0.5 text-[13px] text-slate-500">{role}</p>

      <div className="my-4 border-t border-slate-100" />

      <p className="text-[13.5px] text-slate-600">{specialty}</p>

      <ExpertConnectButton
        expert={{ id, initials, tag, name, specialty }}
        className="mt-5 w-full rounded-lg bg-brand py-2.5 text-center text-[13.5px] font-semibold text-white transition hover:bg-brand-700"
      >
        Connect Now
      </ExpertConnectButton>
    </article>
  )
}
