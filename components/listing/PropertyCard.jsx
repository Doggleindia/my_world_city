import Link from 'next/link'
import { MapPin, Share2, Heart } from 'lucide-react'

export default function PropertyCard({ tag, title, loc, img, href = '/property' }) {
  return (
    <article className="group w-[300px] shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-card">
      <Link href={href} className="block h-44 w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <span className="text-[10.5px] font-bold tracking-wide text-brand">{tag}</span>
        <Link href={href} className="mt-1 block">
          <h3 className="text-[16px] font-bold text-navy-800 transition hover:text-brand">{title}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-[12.5px] text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {loc}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button className="text-slate-400 transition hover:text-brand" aria-label="Share">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
          <Link
            href={href}
            className="flex-1 rounded-lg bg-brand py-2 text-center text-[13px] font-semibold text-white transition hover:bg-brand-700"
          >
            Details
          </Link>
          <button className="text-slate-400 transition hover:text-ember" aria-label="Save">
            <Heart className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </article>
  )
}
