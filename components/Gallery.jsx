import { gallery } from '../data'

export default function Gallery({ bg = 'bg-[#f5f6f8]' }) {
  return (
    <section className={bg}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
            Gallery
          </h2>
          <p className="mx-auto mt-3 text-[17px] leading-relaxed text-slate-500">
            Snapshots from our latest live campaigns
          </p>
        </div>

        {/* tall portrait strip that scrolls sideways, with a visible slim scrollbar */}
        <div className="mwc-scrollbar mt-10 flex gap-4 overflow-x-auto pb-4">
          {gallery.map((src, i) => (
            <div
              key={i}
              className="h-[420px] w-[250px] shrink-0 overflow-hidden rounded-xl sm:h-[460px] sm:w-[268px]"
            >
              <img
                src={src}
                alt={`Campaign ${i + 1}`}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
