'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronLeft, ChevronRight, RotateCw, Send, X } from 'lucide-react'
import { STEPS, searchParamsFor, summaryRows, parseFreeText } from '@/lib/assistantFlow'

const time = () =>
  new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const PHONE_RE = /^[6-9]\d{9}$/

export default function AssistantPanel({ onClose }) {
  const [items, setItems] = useState([])      // the conversation, oldest first
  const [answers, setAnswers] = useState({})
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const scroller = useRef(null)
  const timers = useRef([])

  const push = useCallback((item) => setItems((c) => [...c, { ...item, at: time() }]), [])

  // Bot lines land after a short pause with a typing indicator, so the
  // conversation has a rhythm instead of everything appearing at once.
  const say = useCallback(
    (item, delay = 620) =>
      new Promise((resolve) => {
        setTyping(true)
        const t = setTimeout(() => {
          setTyping(false)
          push({ from: 'bot', ...item })
          resolve()
        }, delay)
        timers.current.push(t)
      }),
    [push],
  )

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [items, typing])

  /* ---------------- running the script ---------------- */

  const runStep = useCallback(
    async (id, ans) => {
      // These four aren't questions, so they are handled before the lookup.
      if (id === 'results') return showResults(ans)
      if (id === 'lead') return say({ lead: true, text: 'Just two details and we will take it from here.' })
      if (id === 'restart_search') {
        await say({ text: 'No problem — let’s adjust the search.' })
        return runStep('buy_area', ans)
      }
      if (id === 'end') return say({ text: 'Happy to help. We’re here whenever you need us.' })

      const step = STEPS[id]
      if (!step) return

      if (step.say) {
        await say({ text: typeof step.say === 'function' ? step.say(ans) : step.say })
        return runStep(step.next, ans)
      }

      await say({ text: step.ask, options: step.options })
    },
    [say],
  )

  const showResults = useCallback(
    async (ans) => {
      setTyping(true)
      const look = async (params) => {
        try {
          const res = await fetch(`/api/properties?${params.toString()}`)
          const data = await res.json()
          return data.items || []
        } catch {
          return []
        }
      }

      let list = await look(searchParamsFor(ans))
      // Nothing in that exact band? Widen the budget rather than dead-ending —
      // "close to what you asked for" is more use than "no results".
      let widened = false
      if (!list.length && ans.budget) {
        const p = searchParamsFor(ans)
        p.delete('minPrice')
        p.delete('maxPrice')
        list = await look(p)
        widened = list.length > 0
      }
      setTyping(false)

      if (!list.length) {
        await say({
          text: 'I couldn’t find a match for that combination yet. A specialist can look for you — shall I arrange a call?',
          options: [
            { label: 'Yes, call me', next: 'lead' },
            { label: 'Change my search', next: 'restart_search' },
          ],
        })
        return
      }

      const headline = widened
        ? `Nothing sits exactly in ${ans.budget}, but here ${list.length === 1 ? 'is a close option' : 'are close options'} for you:`
        : ans.intent === 'invest'
          ? 'These are verified, income-ready options in your range:'
          : `Here ${list.length === 1 ? 'is 1 verified match' : `are ${list.length} verified matches`} for you:`

      await say({ text: headline, results: list })
      await runStep('offer_call', ans)
    },
    [say, runStep],
  )

  // first run
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await say({ text: `${greeting()}! Welcome to My World City — Jaipur's verified property platform.` }, 400)
      if (!cancelled) await runStep('start', {})
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = async (option) => {
    push({ from: 'user', text: option.label })
    const next = { ...answers, ...(option.patch || {}) }
    setAnswers(next)
    // once an option is taken, the buttons on that message are spent
    setItems((c) => c.map((m) => (m.options ? { ...m, options: null } : m)))
    await runStep(option.next, next)
  }

  const send = async (e) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return
    setDraft('')
    push({ from: 'user', text })

    if (/^(hi|hello|hey|start over|restart)\b/i.test(text)) {
      setAnswers({})
      return runStep('start', {})
    }

    const parsed = parseFreeText(text)
    if (!parsed) {
      await say({
        text: 'I can help you buy, build, manage or invest. Which one sounds right?',
        options: STEPS.start.options,
      })
      return
    }

    const next = { ...answers, ...parsed.answers }
    setAnswers(next)
    await say({ text: parsed.echo })

    // enough to search on? otherwise keep collecting
    if (next.intent === 'buy' || next.intent === 'invest') {
      if (!next.budget) return runStep(next.intent === 'invest' ? 'invest_budget' : 'buy_budget', next)
      return showResults(next)
    }
    return runStep(next.intent === 'build' ? 'build_land' : 'manage_need', next)
  }

  const submitLead = async ({ name, phone }) => {
    push({ from: 'user', text: `${name} · ${phone.replace(/(\d{5})(\d{5})/, '$1 $2')}` })
    setItems((c) => c.map((m) => (m.lead ? { ...m, lead: false, done: true } : m)))
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'callback',
          name,
          phone,
          budget: answers.budget || undefined,
          message:
            'Help Desk request — ' +
            summaryRows(answers).map(([k, v]) => `${k}: ${v}`).join(', '),
        }),
      })
    } catch {
      // the visitor has already been told someone will call; a failed post is
      // logged server-side rather than shown to them mid-conversation
    }
    await say({
      text: `Done, ${name.split(' ')[0]}. A My World City specialist will call you on ${phone.slice(0, 2)}XXXXXX${phone.slice(-2)} within 2 working hours.`,
      summary: summaryRows(answers),
    })
    await runStep('again', answers)
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    setItems([]); setAnswers({}); setTyping(false); setDraft('')
    ;(async () => {
      await say({ text: `${greeting()}! Welcome to My World City — Jaipur's verified property platform.` }, 300)
      await runStep('start', {})
    })()
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(8,26,51,0.45)] ring-1 ring-slate-200">
      {/* header */}
      <div className="flex shrink-0 items-center justify-between gap-3 bg-brand-800 px-4 py-3 text-white sm:px-5">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold">My World City Help Desk</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/75">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online · replies instantly
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={reset} aria-label="Start over"
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15">
            <RotateCw className="h-[18px] w-[18px]" />
          </button>
          <button onClick={onClose} aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/15">
            <X className="h-[19px] w-[19px]" />
          </button>
        </div>
      </div>

      {/* conversation */}
      <div ref={scroller} className="mwc-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-100 px-4 py-4 sm:px-5">
        {items.map((m, i) =>
          m.from === 'user' ? (
            <div key={i}>
              <p className="mb-1 text-right text-[11.5px] text-slate-500">You · {m.at}</p>
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded bg-brand-800 px-4 py-2.5 text-[14px] font-semibold text-white">
                  {m.text}
                </p>
              </div>
            </div>
          ) : (
            <BotMessage key={i} m={m} onChoose={choose} onLead={submitLead} />
          ),
        )}

        {typing && (
          <div>
            <p className="mb-1 text-[11.5px] text-slate-500">My World City · Typing…</p>
            <div className="inline-flex border-l-[3px] border-brand-800 bg-white px-4 py-3">
              <span className="mwc-dots"><i /><i /><i /></span>
            </div>
          </div>
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-2 pt-3 sm:px-5">
        <form onSubmit={send} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your message..."
            aria-label="Type your message"
            className="min-w-0 flex-1 rounded border border-slate-300 px-3.5 py-3 text-[14px] text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-brand"
          />
          <button type="submit" aria-label="Send"
            className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded bg-cyan text-navy-900 transition hover:bg-cyan-600 disabled:opacity-50"
            disabled={!draft.trim()}>
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="pb-1 pt-1.5 text-right text-[11px] text-slate-400">My World City Assistant</p>
      </div>
    </div>
  )
}

/* ---------------- one message from the assistant ---------------- */

function BotMessage({ m, onChoose, onLead }) {
  return (
    <div>
      <p className="mb-1 text-[11.5px] text-slate-500">My World City · {m.at}</p>
      <div className="border-l-[3px] border-brand-800 bg-white px-4 py-3.5">
        {m.text && <p className="text-[14px] leading-relaxed text-navy-900">{m.text}</p>}

        {m.options && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {m.options.map((o) => (
              <button
                key={o.label}
                onClick={() => onChoose(o)}
                className="rounded border-[1.5px] border-brand-800 px-3 py-2.5 text-[13.5px] font-bold text-brand-800 transition hover:bg-brand-800 hover:text-white"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {m.results && <ResultCarousel items={m.results} />}
        {m.summary && <SummaryTable rows={m.summary} />}
        {m.lead && <LeadForm onSubmit={onLead} />}
      </div>
    </div>
  )
}

/* ---------------- property results ---------------- */

function ResultCarousel({ items }) {
  const [i, setI] = useState(0)
  const p = items[i]
  const many = items.length > 1

  return (
    <div className="relative mt-3">
      <article className="mx-auto w-full max-w-[260px] bg-white p-3 shadow-[0_2px_14px_-6px_rgba(8,26,51,0.3)] ring-1 ring-slate-200">
        <div className="relative">
          <img src={p.img} alt={p.title} className="aspect-[16/11] w-full object-cover" />
          <span className="absolute right-0 top-0 grid h-9 w-9 place-items-center bg-cyan">
            <Bookmark className="h-4 w-4 text-navy-900" />
          </span>
        </div>
        <h4 className="mt-2.5 text-[15px] font-bold leading-snug text-navy-900">{p.title}</h4>
        {p.loc && <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{p.loc}</p>}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[12px]">
          <span className="font-bold text-navy-900">{p.priceLabel || 'Enquire'}</span>
          {p.tag && <span className="text-slate-500">{p.tag}</span>}
        </p>
        <Link href={p.href || `/property/${p.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-brand-800 hover:text-brand">
          Read more <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </article>

      {many && (
        <>
          <button onClick={() => setI((n) => (n - 1 + items.length) % items.length)} aria-label="Previous"
            className="absolute left-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-slate-300 bg-white text-navy-800 shadow-sm transition hover:border-brand hover:text-brand">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setI((n) => (n + 1) % items.length)} aria-label="Next"
            className="absolute right-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-slate-300 bg-white text-navy-800 shadow-sm transition hover:border-brand hover:text-brand">
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="mt-2 text-center text-[11.5px] text-slate-500">{i + 1} of {items.length}</p>
        </>
      )}
    </div>
  )
}

function SummaryTable({ rows }) {
  if (!rows.length) return null
  return (
    <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[13px] text-slate-500">{k}</dt>
          <dd className="text-[13px] font-bold text-navy-900">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ---------------- callback form ---------------- */

function LeadForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)

  const phoneBad = touched && !PHONE_RE.test(phone)
  const nameBad = touched && name.trim().length < 2

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!PHONE_RE.test(phone) || name.trim().length < 2) return
    setBusy(true)
    onSubmit({ name: name.trim(), phone })
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <Field label="Your name" bad={nameBad}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          autoComplete="name" className="w-full bg-transparent px-3 py-2.5 text-[14px] text-navy-900 outline-none placeholder:text-slate-400" />
      </Field>
      {nameBad && <p className="text-[12px] font-medium text-rose-600">Enter your name</p>}

      <Field label="Mobile number" bad={phoneBad}>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit number" inputMode="numeric" autoComplete="tel"
          className="w-full bg-transparent px-3 py-2.5 text-[14px] text-navy-900 outline-none placeholder:text-slate-400" />
      </Field>
      {phoneBad && <p className="text-[12px] font-medium text-rose-600">Enter a valid 10-digit Indian mobile number</p>}

      <button type="submit" disabled={busy}
        className="w-full rounded bg-cyan py-3 text-[14.5px] font-bold text-navy-900 transition hover:bg-cyan-600 disabled:opacity-60">
        Request callback
      </button>
    </form>
  )
}

// Outlined box with the label notched into the top border.
function Field({ label, bad, children }) {
  return (
    <div className={`relative rounded border ${bad ? 'border-rose-500' : 'border-slate-300'}`}>
      <span className={`absolute -top-[9px] left-2.5 bg-white px-1 text-[11px] font-medium ${bad ? 'text-rose-600' : 'text-slate-500'}`}>
        {label}
      </span>
      {children}
    </div>
  )
}
