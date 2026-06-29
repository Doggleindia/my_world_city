import { X, Check } from 'lucide-react'

export default function SuccessCard({ refId, onClose }) {
  return (
    <div
      className="relative my-auto w-full max-w-[460px] overflow-hidden rounded-3xl bg-white px-8 pb-8 pt-6 text-center shadow-2xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Check with glow */}
      <div className="relative mx-auto mt-6 grid h-20 w-20 place-items-center">
        <span className="absolute h-20 w-20 rounded-full bg-emerald-400/40 blur-xl" />
        <span className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <Check className="h-10 w-10" strokeWidth={3} />
        </span>
      </div>

      <h3 className="mt-6 text-[30px] font-extrabold text-navy-800">Success!</h3>
      <p className="mx-auto mt-3 max-w-[18rem] text-[15px] leading-relaxed text-slate-500">
        Your request has been submitted successfully. We&apos;ll be in touch shortly.
      </p>

      <div className="mt-6 inline-block rounded-full bg-brand/10 px-4 py-2 text-[13px] font-bold tracking-wide text-brand">
        REF: {refId}
      </div>

      <button
        onClick={onClose}
        className="mt-8 w-full rounded-full bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700"
      >
        Done
      </button>
    </div>
  )
}
