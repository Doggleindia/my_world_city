import { ArrowRight } from 'lucide-react'

export default function TopBar() {
  return (
    <div className="bg-navy-900 text-white text-[13px]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-2 text-center">
        <span className="text-slate-200">
          Are you a dealer? Get verified buyer leads delivered instantly to your phone.
        </span>
        <button className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold text-navy-900 transition hover:bg-white">
          Try free for 5 leads <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
