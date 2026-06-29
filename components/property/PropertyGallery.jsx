import { Heart } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import ShareButton from '@/components/ShareButton'
import PhotoLightbox from '@/components/property/PhotoLightbox'

export default function PropertyGallery({ gallery, verified, photoCount, propertyId }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.55fr_1fr]">
      {/* Main image */}
      <div className="group relative overflow-hidden rounded-2xl">
        <img
          src={gallery.main}
          alt="Property"
          className="h-[300px] w-full object-cover sm:h-[380px] md:h-[420px]"
        />

        {verified && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-navy-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Verified
          </span>
        )}

        <div className="absolute right-4 top-4 flex items-center gap-2">
          {propertyId ? (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm">
              <SaveButton id={propertyId} />
            </span>
          ) : (
            <button
              aria-label="Save"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:text-ember"
            >
              <Heart className="h-[18px] w-[18px]" />
            </button>
          )}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm">
            <ShareButton className="hover:text-brand" size={18} />
          </span>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 gap-3">
        {gallery.thumbs.map((src, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl">
            <img
              src={src}
              alt={`View ${i + 1}`}
              className="h-[145px] w-full object-cover sm:h-[185px] md:h-[204px]"
            />
            {i === gallery.thumbs.length - 1 && (
              <PhotoLightbox images={[gallery.main, ...gallery.thumbs]} count={photoCount} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
