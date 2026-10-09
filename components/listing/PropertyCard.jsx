import Link from 'next/link'
import { ArrowRight, Bookmark, MapPin, Ruler } from 'lucide-react'
import SaveButton from '@/components/SaveButton'

// The one listing card used everywhere a property is shown in a grid:
// Featured on the home page, Find Property results and the Saved page.
//
//   availability — "Leasing now" / "For sale"
//   type         — the category (Residential, Commercial, …)
//   size         — the area the owner entered
//
// `onUnsave` (Saved page) swaps the save toggle for a remove button.
// Cards without an id (static fallback content) show a plain bookmark.

// category → accent colour (same palette as the icons under the hero)
const ACCENT = {
  Residential: '#17838c',
  Commercial: '#2b5fc9',
  Industrial: '#c0392b',
  'Farm & Agri': '#2e9e5b',
}

export default function PropertyCard({
  id,
  title,
  address,
  availability,
  type,
  size,
  img,
  href = '/find-property',
  onUnsave,
  className = '',
}) {
  const accent = ACCENT[type] || '#0b3f80'

  return (
    <article
      style={{ '--c': accent }}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_-18px_rgba(8,26,51,0.45)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--c)]/40 hover:shadow-[0_22px_40px_-20px_rgba(8,26,51,0.5)] ${className}`}
    >
      <div className="relative overflow-hidden">
        <Link href={href} className="block">
          <img
            src={img}
            alt={title}
            className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {/* category ribbon, coloured per category */}
        {type && (
          <span className="absolute left-3 top-3 rounded-full bg-[color:var(--c)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            {type}
          </span>
        )}
        {/* save square in the photo's top-right corner */}
        <span className="absolute right-0 top-0 grid h-12 w-12 place-items-center rounded-bl-2xl bg-[#5fd9e8] text-navy-900 sm:h-14 sm:w-14">
          {onUnsave ? (
            <button
              type="button"
              onClick={onUnsave}
              aria-label="Remove from saved"
              className="grid h-full w-full place-items-center transition hover:text-navy-900/70"
            >
              <Bookmark className="h-6 w-6" fill="currentColor" />
            </button>
          ) : id ? (
            <SaveButton id={id} icon="bookmark" size={24} className="grid h-full w-full place-items-center hover:text-navy-900/70" />
          ) : (
            <Bookmark className="h-6 w-6" aria-hidden="true" />
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* title with a short accent rule beneath — the thing the eye lands on */}
        <Link href={href} className="block">
          <h3 className="text-[21px] font-bold leading-[1.25] text-navy-900 transition group-hover:text-[color:var(--c)] sm:text-[22px]">
            {title}
          </h3>
        </Link>
        <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-[color:var(--c)] to-[#5fd9e8] transition-all duration-300 group-hover:w-20" />

        {address && (
          <p className="mt-3.5 flex items-start gap-1.5 text-[15px] leading-snug text-[#0A0A0A]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--c)]" /> {address}
          </p>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#0A0A0A]">
          {availability && <span className="font-bold">{availability}</span>}
          {size && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              <Ruler className="h-4 w-4 shrink-0" strokeWidth={1.75} /> {size}
            </span>
          )}
        </p>

        {/* mt-auto keeps every card's button on the same baseline */}
        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand-800 py-2.5 text-[14px] font-bold text-white transition hover:bg-navy-700"
        >
          Read more <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
