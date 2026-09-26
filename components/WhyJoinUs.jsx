export default function WhyJoinUs() {
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

          {/* the artwork carries its own pale background and line pattern;
              the "Find property" shortcut is the floating button on the page */}
          <div className="mx-auto w-full max-w-[554px] lg:ml-auto lg:mr-0">
            <img
              src="/why-join-us.png"
              alt="A hand holding a model house"
              width={554}
              height={400}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
