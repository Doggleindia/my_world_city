'use client'

import { useState } from 'react'

export default function HeroTabs() {
  const [tab, setTab] = useState('find')

  return (
    <div className="mt-8 flex w-full max-w-md overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-card">
      <button
        onClick={() => setTab('find')}
        className={`flex-1 rounded-full px-6 py-2.5 text-[14px] font-semibold transition ${
          tab === 'find' ? 'bg-brand text-white' : 'text-slate-600 hover:text-navy-800'
        }`}
      >
        Find Solution
      </button>
      <button
        onClick={() => setTab('post')}
        className={`flex-1 rounded-full px-6 py-2.5 text-[14px] font-semibold transition ${
          tab === 'post' ? 'bg-brand text-white' : 'text-slate-600 hover:text-navy-800'
        }`}
      >
        Post Requirement
      </button>
    </div>
  )
}
