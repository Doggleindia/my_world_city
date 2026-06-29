import { gallery } from '../data'

export default function Gallery({ bg = 'bg-white' }) {
  return (
    <section className={bg}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-navy-800 sm:text-3xl">Gallery</h2>
          <p className="mt-2 text-[14px] text-slate-500">
            Snapshots from our latest live campaigns
          </p>
        </div>

        <div className="no-scrollbar mt-8 flex gap-4 overflow-x-auto pb-2">
          {gallery.map((src, i) => (
            <div
              key={i}
              className="h-52 min-w-[260px] flex-1 overflow-hidden rounded-2xl"
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
