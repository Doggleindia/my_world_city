'use client'

import { MessageCircle } from 'lucide-react'
import { useAssistant } from '@/components/assistant/AssistantProvider'

export default function WhyJoinUs() {
  const { openAssistant } = useAssistant()

  return (
    <section className="mt-10 bg-white sm:mt-14">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[clamp(34px,5vw,64px)] font-bold leading-[1.1] text-[#0A0A0A]">
              Why Join Us?
            </h2>
            <p className="mt-7 max-w-[560px] text-[16px] leading-[1.55] text-[#0A0A0A]">
              My World City is Jaipur's verified property platform — built for
              anyone who wants to buy, build, manage or invest in property
              without the hunt, the doubt or the runaround. We bring real
              listings, trusted professionals and the right approvals together
              under one roof — so whether you're moving in, building from the
              ground up, or putting money to work, the right people and the
              right properties are already lined up for you.
            </p>
            <p className="mt-7 text-[16px] leading-[1.55] text-[#0A0A0A]">
              Every property, real. Every partner, verified. Every step, guided.
            </p>
          </div>

          {/* the artwork carries its own pale background and line pattern */}
          <div className="relative mx-auto w-full max-w-[554px] lg:ml-auto lg:mr-0">
            <img
              src="/why-join-us.png"
              alt="A hand holding a model house"
              width={554}
              height={400}
              className="block h-auto w-full"
            />
            {/* shortcut straight into search, sitting over the image */}
            <button
              id="why-join-find-property"
              type="button"
              onClick={openAssistant}
              className="absolute right-1.5 top-0 inline-flex items-center gap-2.5 rounded-md bg-brand-800 px-4 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(8,26,51,0.6)] transition hover:bg-navy-700 sm:px-5 sm:py-[18px] sm:text-[15px]"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              Find property
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
