import Link from 'next/link'
import { MapPin, Heart } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

export default function SavedCard({ tag, title, loc, img, href = '/find-property', onUnsave }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="h-64 w-full overflow-hidden">
        <img src={img} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="p-5">
        <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold tracking-wide text-brand">
          {tag}
        </span>
        <h3 className="mt-3 text-[20px] font-bold text-navy-800">{title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-[14px] text-slate-500">
          <MapPin className="h-4 w-4 text-slate-400" /> {loc}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <ShareButton url={href} title={title} size={18} />
          </span>
          <Link
            href={href}
            className="flex-1 rounded-full bg-brand py-3 text-center text-[15px] font-semibold text-white transition hover:bg-brand-700"
          >
            Details
          </Link>
          <button
            onClick={onUnsave}
            aria-label="Remove from saved"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-500 text-white transition hover:bg-amber-600"
          >
            <Heart className="h-[18px] w-[18px]" fill="currentColor" />
          </button>
        </div>
      </div>
    </article>
  )
}
