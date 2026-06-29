import {
  Scale,
  Ruler,
  PencilRuler,
  Wrench,
  Landmark,
  Home,
  Sun,
  Lightbulb,
  BadgeCheck,
} from 'lucide-react'

const iconMap = { Scale, Ruler, PencilRuler, Wrench, Landmark, Home, Sun, Lightbulb }

export default function ServiceCard({ icon, title, desc, partners, bg, onSelect }) {
  const Icon = iconMap[icon] ?? Scale
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-card">
      <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${bg}`}>
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mt-7 text-[17px] font-bold text-navy-800">{title}</h3>
      <p className="mt-1 truncate text-[13px] text-slate-500">{desc}</p>

      <div className="mt-5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
          <BadgeCheck className="h-3 w-3" /> {partners} Verified Partners
        </span>
        <button
          onClick={onSelect}
          className="shrink-0 rounded-lg bg-navy-800 px-3 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-navy-700"
        >
          Send Request
        </button>
      </div>
    </article>
  )
}
