import { ClipboardList, Handshake, MessageSquare } from 'lucide-react'
import { serviceSteps } from '@/data'
import AttachFileButton from '@/components/contact/AttachFileButton'

const iconMap = { ClipboardList, Handshake, MessageSquare }

export default function ServicesHero() {
  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6">
        <h1 className="text-[34px] font-extrabold tracking-tight text-brand sm:text-[44px]">
          From search to possession handled.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-slate-700 sm:text-[18px]">
          Every step of your property journey, supported by My World City&apos;s verified partners.
        </p>

        {/* Process card */}
        <div className="mx-auto mt-9 max-w-3xl rounded-2xl bg-white p-3 shadow-card sm:p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {serviceSteps.map((s) => {
              const Icon = iconMap[s.icon]
              return (
                <div key={s.title} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${s.bg}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-navy-800">{s.title}</p>
                    <p className="text-[12.5px] text-slate-500">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* send a document or photo straight to the concierge team */}
          <div className="mt-3 flex flex-col items-center justify-between gap-3 rounded-xl border border-dashed border-brand/30 bg-brand/5 px-4 py-3.5 text-left sm:flex-row sm:px-5">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-navy-800">Have a document or photo to share?</p>
              <p className="text-[12.5px] text-slate-500">Attach a site plan, agreement or picture and our concierge team will take it from there.</p>
            </div>
            <AttachFileButton
              className="shrink-0"
              topic="Concierge service request"
              title="Connect to us"
              subtitle="Your file is attached — add your details and our concierge team will source it."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
