import { Play } from 'lucide-react'
import { gallery } from '../data'

// Campaign reels: a tall portrait strip that glides sideways on its own, in an
// endless loop (the list is drawn twice and slides by exactly one copy, so the
// seam never shows). Hovering or touching the strip pauses it.
//
// An item in `gallery` is either an image URL, or { video, poster } for a clip —
// clips play muted on loop. Every tile carries a play badge so the strip reads
// as reels.
function Tile({ item, index, hidden }) {
  const isVideo = typeof item === 'object' && item?.video
  const src = isVideo ? item.poster : item

  return (
    <div
      aria-hidden={hidden || undefined}
      className="group relative h-[420px] w-[250px] shrink-0 overflow-hidden rounded-xl bg-navy-900 sm:h-[460px] sm:w-[268px]"
    >
      {isVideo ? (
        <video
          src={item.video}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={src}
          alt={hidden ? '' : `Campaign ${index + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}

      {/* soft shade so the badge reads on bright photos */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/55 via-navy-900/5 to-navy-900/20" />

      {/* play badge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 ring-1 ring-white/60 backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-white/35"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-800 shadow-[0_6px_18px_-6px_rgba(8,26,51,0.6)]">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </span>
      </span>
    </div>
  )
}

export default function Gallery({ bg = 'bg-white' }) {
  return (
    <section className={bg}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-[clamp(32px,4.6vw,58px)] font-bold leading-[1.1] text-[#0A0A0A]">
            Gallery
          </h2>
          <p className="mx-auto mt-4 text-[17px] leading-relaxed text-slate-600 sm:text-[21px] lg:mt-6 lg:text-[26px]">
            Snapshots from our latest live campaigns
          </p>
        </div>
      </div>

      {/* full-width, endlessly gliding strip */}
      <div className="mwc-marquee -mt-6 overflow-hidden pb-16">
        <div className="mwc-marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-4 pr-4" aria-hidden={copy === 1 || undefined}>
              {gallery.map((item, i) => (
                <Tile key={i} item={item} index={i} hidden={copy === 1} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
