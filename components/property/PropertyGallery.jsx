import { BadgeCheck, Heart, Share2, Grid2x2 } from 'lucide-react'

export default function PropertyGallery({ gallery, verified, photoCount }) {
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
          <button
            aria-label="Save"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:text-ember"
          >
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <button
            aria-label="Share"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:text-brand"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
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
              <button className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 to-transparent p-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur-sm">
                  <Grid2x2 className="h-4 w-4" /> View all {photoCount} photos
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
