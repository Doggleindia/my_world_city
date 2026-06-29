import {
  GraduationCap, BadgeCheck, Leaf, Newspaper, Scale, FileCheck, Award,
  ShieldCheck, HardHat, Sofa, Landmark, Banknote, Compass, BookOpen, Sun,
} from 'lucide-react'

const iconMap = {
  GraduationCap, BadgeCheck, Leaf, Newspaper, Scale, FileCheck, Award,
  ShieldCheck, HardHat, Sofa, Landmark, Banknote, Compass, BookOpen, Sun,
}

export default function ProfileSkills({ p }) {
  return (
    <section className="bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-[22px] font-extrabold text-navy-800 sm:text-[26px]">
          What {p.firstName} works on
        </h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {p.worksOn.map((w) => (
            <span
              key={w}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600"
            >
              {w}
            </span>
          ))}
        </div>

        <h2 className="mt-14 text-[22px] font-extrabold text-navy-800 sm:text-[26px]">
          Qualifications &amp; recognition
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.qualifications.map((q) => {
            const Icon = iconMap[q.icon] ?? BadgeCheck
            return (
              <div key={q.title} className="rounded-2xl bg-white p-5 shadow-sm">
                <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${q.bg}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[15px] font-bold text-navy-800">{q.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{q.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
