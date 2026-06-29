import {
  MapPin,
  Users,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  Trees,
  Droplet,
  Fence,
  Dumbbell,
} from 'lucide-react'

const iconMap = {
  Users,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  Trees,
  Droplet,
  Fence,
  Dumbbell,
}

function Cell({ l, v }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-[13.5px] text-slate-500">{l}</span>
      <span className="text-[13.5px] font-semibold text-navy-800">{v}</span>
    </div>
  )
}

export default function PropertyDetails({ property }) {
  return (
    <div>
      {/* Title block */}
      <span className="text-[12px] font-bold tracking-wide text-brand">{property.category}</span>
      <h1 className="mt-1.5 text-[30px] font-extrabold leading-tight text-navy-800 sm:text-[34px]">
        {property.title}
      </h1>
      <p className="mt-1.5 text-[14px] text-slate-500">{property.area}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[14px] text-slate-600">
        <MapPin className="h-4 w-4 text-slate-400" /> {property.location}
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {property.badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12.5px] font-medium text-slate-700"
          >
            {b}
          </span>
        ))}
      </div>

      {/* Key details */}
      <section className="mt-9">
        <h2 className="text-[19px] font-bold text-navy-800">Key details</h2>
        <div className="mt-3 grid grid-cols-1 gap-x-12 border-t border-slate-200 md:grid-cols-2">
          {property.keyDetails.map((row, i) => (
            <div key={i} className="contents">
              <div className="border-b border-slate-200">
                <Cell l={row[0].l} v={row[0].v} />
              </div>
              <div className="border-b border-slate-200">
                <Cell l={row[1].l} v={row[1].v} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="mt-9">
        <h2 className="text-[19px] font-bold text-navy-800">Amenities</h2>
        <div className="mt-4 grid grid-cols-2 gap-y-5 gap-x-6 sm:grid-cols-4">
          {property.amenities.map((a) => {
            const Icon = iconMap[a.icon] ?? Users
            return (
              <div key={a.label} className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[13.5px] font-medium text-slate-700">{a.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* About */}
      <section className="mt-9">
        <h2 className="text-[19px] font-bold text-navy-800">About this property</h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-600">{property.about}</p>
      </section>

      {/* Location */}
      <section className="mt-9">
        <h2 className="text-[19px] font-bold text-navy-800">Location</h2>

        <div className="relative mt-4 h-[280px] overflow-hidden rounded-2xl border border-slate-200">
          <MapBackground />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[85%]">
            <MapPinGfx />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {property.distances.map((d) => (
            <div key={d.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[12.5px] text-slate-500">{d.label}</p>
              <p className="mt-0.5 text-[16px] font-bold text-brand">{d.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* Stylised street-map backdrop, drawn inline so it renders without a maps key. */
function MapBackground() {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 280">
      <rect width="800" height="280" fill="#eef1f5" />
      <polygon points="560,0 800,0 800,120 620,140" fill="#dce8d8" />
      <polygon points="0,180 150,200 120,280 0,280" fill="#dce8d8" />
      <polygon points="430,210 540,230 520,280 410,280" fill="#dce8d8" />
      <g stroke="#ffffff" strokeWidth="10" fill="none">
        <path d="M-20 70 L820 40" />
        <path d="M-20 200 L820 170" />
        <path d="M120 -20 L160 300" />
        <path d="M430 -20 L470 300" />
        <path d="M650 -20 L700 300" />
      </g>
      <g stroke="#ffffff" strokeWidth="5" fill="none">
        <path d="M-20 130 L820 110" />
        <path d="M280 -20 L300 300" />
        <path d="M560 -20 L600 300" />
      </g>
    </svg>
  )
}

/* Gradient teardrop pin matching the reference. */
function MapPinGfx() {
  return (
    <svg width="72" height="92" viewBox="0 0 72 92" fill="none" className="drop-shadow-lg">
      <defs>
        <linearGradient id="pinGrad" x1="36" y1="0" x2="36" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0883e" />
          <stop offset="0.55" stopColor="#3b6fd4" />
          <stop offset="1" stopColor="#1f5fbf" />
        </linearGradient>
      </defs>
      <path
        d="M36 0C16.6 0 1 15.6 1 35c0 24.5 31 54 33.3 56.2a2.4 2.4 0 0 0 3.4 0C40 89 71 59.5 71 35 71 15.6 55.4 0 36 0Z"
        fill="url(#pinGrad)"
      />
      <circle cx="36" cy="33" r="12" fill="#ffffff" fillOpacity="0.92" />
    </svg>
  )
}
