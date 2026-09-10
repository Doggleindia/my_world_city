import Link from 'next/link'
import { MapPin, Eye, MessageSquare } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import ShareButton from '@/components/ShareButton'

export default function PropertyCard({
  id,
  tag,
  title,
  loc,
  img,
  views = 0,
  enquiries = 0,
  href = '/find-property',
  priceLabel,
  className = 'w-[300px] shrink-0',
}) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-card ${className}`}
    >
      <Link href={href} className="block h-44 w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-bold tracking-wide text-brand">{tag}</span>
          {priceLabel && (
            <span className="text-[13px] font-extrabold text-navy-800">{priceLabel}</span>
          )}
        </div>
        <Link href={href} className="mt-1 block">
          <h3 className="text-[16px] font-bold text-navy-800 transition hover:text-brand">{title}</h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-[12.5px] text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {loc}
        </p>

        {/* Live counts, so two listings can be compared at a glance. Hidden
            until there is something real to report. */}
        {(views > 0 || enquiries > 0) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-brand" /> {views.toLocaleString('en-IN')} views
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> {enquiries}{' '}
              {enquiries === 1 ? 'enquiry' : 'enquiries'}
            </span>
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <ShareButton url={href} title={title} className="text-slate-400 hover:text-brand" />

          <Link
            href={href}
            className="flex-1 rounded-full bg-brand py-2 text-center text-[13px] font-semibold text-white transition hover:bg-brand-700"
          >
            Details
          </Link>
          <SaveButton id={id} />
        </div>
      </div>
    </article>
  )
}
