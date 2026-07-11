import { Hammer } from 'lucide-react'

// Placeholder for admin sections that aren't built yet, so the sidebar nav
// never dead-ends. Each becomes a real screen as we work through the designs.
export default function ComingSoon({ title, note }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="text-[24px] font-extrabold tracking-tight text-navy-900">{title}</h1>
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Hammer className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-[18px] font-bold text-navy-800">We’re building this screen</h2>
        <p className="mt-1.5 max-w-sm px-6 text-[14px] text-slate-500">
          {note || 'This section is next up. The navigation and structure are ready — the screen lands soon.'}
        </p>
      </div>
    </div>
  )
}
