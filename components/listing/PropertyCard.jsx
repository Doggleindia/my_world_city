import Link from 'next/link'
import { Bookmark, ChevronRight, Ruler } from 'lucide-react'
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
export default function PropertyCard({
  id,
  title,
  address,
  availability,
  type,
  size,
  img,
  href = '/find-property',
  priceLabel,
  onUnsave,
  className = '',
}) {
  return (
    <article
      className={`group flex flex-col bg-white p-5 shadow-[0_1px_4px_rgba(8,26,51,0.08)] transition hover:shadow-card ${className}`}
    >
      <div className="relative overflow-hidden">
        <Link href={href} className="block">
          <img
            src={img}
            alt={title}
            className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {/* save square, flush with the photo's top-right corner */}
        <span className="absolute right-0 top-0 grid h-14 w-14 place-items-center bg-[#5fd9e8] text-navy-900 sm:h-16 sm:w-16">
          {onUnsave ? (
            <button
              type="button"
              onClick={onUnsave}
              aria-label="Remove from saved"
              className="grid h-full w-full place-items-center transition hover:text-navy-900/70"
            >
              <Bookmark className="h-7 w-7" fill="currentColor" />
            </button>
          ) : id ? (
            <SaveButton id={id} icon="bookmark" size={28} className="grid h-full w-full place-items-center hover:text-navy-900/70" />
          ) : (
            <Bookmark className="h-7 w-7" aria-hidden="true" />
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        <Link href={href} className="mt-5 block">
          <h3 className="text-[22px] font-bold leading-[1.3] text-[#0A0A0A] transition group-hover:text-brand sm:text-[24px]">
            {title}
          </h3>
        </Link>

        {address && (
          <p className="mt-3 max-w-[18rem] text-[16px] leading-[1.5] text-[#0A0A0A]">{address}</p>
        )}

        <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-[16px] text-[#0A0A0A]">
          {availability && <span className="font-bold">{availability}</span>}
          {type && <span>{type}</span>}
          {priceLabel && <span className="font-bold text-brand-800">{priceLabel}</span>}
        </p>

        {size && (
          <p className="mt-3 flex items-center gap-3 text-[16px] text-[#0A0A0A]">
            <Ruler className="h-6 w-6 shrink-0" strokeWidth={1.75} />
            {size}
          </p>
        )}

        {/* mt-auto keeps every card's link on the same baseline */}
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[17px] font-bold text-brand-800 transition hover:gap-2.5 hover:text-brand"
        >
          Read more <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  )
}
