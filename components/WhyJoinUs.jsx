export default function WhyJoinUs() {
  return (
    <section className="mt-16 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-800 sm:text-3xl">
              Why Join Us?
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-slate-500">
              My World City is Jaipur's verified property platform — built for
              anyone who wants to buy, build, manage or invest in property
              without the hunt, the doubt or the runaround. We bring real
              listings, trusted professionals and the right approvals together
              under one roof — so whether you're moving in, building from the
              ground up, or putting money to work, the right people and the
              right properties are already lined up for you.
            </p>
            <p className="mt-5 text-[14px] font-semibold text-navy-800">
              Every property, real. Every partner, verified. Every step, guided.
            </p>
          </div>

          <div className="flex justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-4">
            <img
              src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=900&q=80"
              alt="Verified property in hand"
              className="h-64 w-full max-w-md rounded-2xl object-cover shadow-card"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
