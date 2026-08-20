// import { Map, ShieldCheck, Sparkles } from 'lucide-react'
// import { developFeatures } from '@/data'

// const iconMap = { Map, ShieldCheck, Sparkles }

// export default function DevelopFeatures() {
//   return (
//     <section className="bg-white">
//       <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
//         <div className="grid gap-8 sm:grid-cols-3">
//           {developFeatures.map((f) => {
//             const Icon = iconMap[f.icon]
//             return (
//               <div key={f.title}>
//                 <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${f.bg}`}>
//                   <Icon className="h-5 w-5" />
//                 </span>
//                 <h3 className="mt-4 text-[16px] font-bold text-navy-800">{f.title}</h3>
//                 <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{f.desc}</p>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </section>
//   )
// }







// components/develop/DevelopFeatures.jsx
import { Map, ShieldCheck, Sparkles } from 'lucide-react'
import { developFeatures } from '@/data'

const iconMap = { Map, ShieldCheck, Sparkles }

export default function DevelopFeatures() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {developFeatures.map((f) => {
            const Icon = iconMap[f.icon]
            return (
              <div key={f.title}>
                <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${f.bg}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-navy-800">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}