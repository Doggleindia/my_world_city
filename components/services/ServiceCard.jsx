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
  ArrowRight,
} from 'lucide-react'

const iconMap = { Scale, Ruler, PencilRuler, Wrench, Landmark, Home, Sun, Lightbulb }

// Darken a hex colour for the icon-tile gradient and button hover.
function shade(hex, amount = 0.78) {
  const n = parseInt(hex.replace('#', ''), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * amount))
  return `rgb(${c.join(',')})`
}

export default function ServiceCard({ icon, title, desc, tagline, partners, color = '#1f5fbf', onSelect }) {
  const Icon = iconMap[icon] ?? Scale

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card"
      style={{ '--c': color }}
    >
      {/* colour bar along the top edge */}
      <span
        className="absolute inset-x-0 top-0 h-1.5 origin-left transition-transform duration-300 group-hover:scale-y-[1.6]"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }}
      />

      {/* soft wash in the corner, warms up on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-25"
        style={{ background: color }}
      />

      {/* oversized ghost of the same icon — gives each card its own silhouette */}
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -right-3 h-28 w-28 opacity-[0.06] transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:opacity-[0.11]"
        style={{ color }}
        strokeWidth={1.5}
      />

      <span
        className="relative grid h-12 w-12 place-items-center rounded-xl text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${color}, ${shade(color)})`,
          boxShadow: `0 10px 20px -8px ${color}b3`,
        }}
      >
        <Icon className="h-[22px] w-[22px]" />
      </span>

      <h3 className="relative mt-6 text-[17px] font-bold text-navy-900">{title}</h3>
      <p className="relative mt-1 text-[13px] leading-relaxed text-slate-500">{desc}</p>

      {tagline && (
        <p className="relative mt-1.5 text-[11.5px] font-semibold uppercase tracking-wide" style={{ color }}>
          {tagline}
        </p>
      )}

      {/* mt-auto keeps every card's footer on the same baseline */}
      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-2.5 pt-5">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ backgroundColor: `${color}1a`, color: shade(color, 0.85) }}
        >
          <BadgeCheck className="h-3 w-3" /> {partners} Verified
        </span>
        <button
          onClick={onSelect}
          className="group/btn inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition-all duration-300"
          style={{ background: `linear-gradient(135deg, ${color}, ${shade(color)})`, boxShadow: `0 8px 16px -8px ${color}` }}
        >
          Send Request
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}
