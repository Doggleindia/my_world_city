'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, Building2, Check, Factory, Hammer, Home, KeyRound, MapPin, PhoneCall,
  RotateCw, Search, Send, Settings, Sparkles, Sprout, Store, TrendingUp, Wallet, Warehouse, X,
} from 'lucide-react'
import {
  STEPS, searchParamsFor, summaryRows, parseFreeText, showcaseFor, rankByKind, nounFor, answerQuestion,
} from '@/lib/assistantFlow'

const time = () =>
  new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const PHONE_RE = /^[6-9]\d{9}$/

/* ---------------- colour + icon for each answer ---------------- */

// The four journeys use the same colours as the icons under the hero, so the
// chat feels like part of the page rather than a bolt-on.
const TEAL = '#17838c', BLUE = '#2b5fc9', RED = '#c0392b', ORANGE = '#e8811c'
const GREEN = '#2e9e5b', INDIGO = '#4f46e5', AMBER = '#c77700', BRAND = '#0b3f80'

const LOOKS = [
  [/^buy or lease|^buy$|residential|villa|apartment|home/i, Home, TEAL],
  [/lease|rent/i, KeyRound, INDIGO],
  [/build|architect|contractor/i, Hammer, BLUE],
  [/manage|maintain|both/i, Settings, RED],
  [/invest|income|appreciation|returns/i, TrendingUp, ORANGE],
  [/factory|industrial/i, Factory, RED],
  [/warehouse/i, Warehouse, RED],
  [/shop|showroom/i, Store, BLUE],
  [/commercial|office|building/i, Building2, BLUE],
  [/farm|plot|land/i, Sprout, GREEN],
  [/₹|budget/i, Wallet, AMBER],
  [/call me|specialist/i, PhoneCall, GREEN],
  [/new search|other options|change my search/i, Search, INDIGO],
  [/^yes|own it/i, Check, GREEN],
  [/jaipur|nagar|road|pura|scheme|sarovar/i, MapPin, INDIGO],
]
const lookFor = (label) => {
  const hit = LOOKS.find(([re]) => re.test(label))
  return hit ? { Icon: hit[1], color: hit[2] } : { Icon: Sparkles, color: BRAND }
}
const CATEGORY_COLOR = { RESIDENTIAL: TEAL, COMMERCIAL: BLUE, INDUSTRIAL: RED, 'FARM & AGRI': GREEN }
const CHIP_COLORS = [TEAL, BLUE, ORANGE, INDIGO, GREEN, RED, AMBER]

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

  // Follow the conversation down — except right after results arrive: then
  // hold the view on the property cards so the follow-up question beneath
  // them doesn't push them out of sight.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const messages = el.querySelectorAll('[data-msg]')
    const recent = [...messages].slice(-2).find((m) => m.hasAttribute('data-results'))
    const top = recent ? recent.offsetTop - 8 : el.scrollHeight
    el.scrollTo({ top, behavior: 'smooth' })
  }, [items, typing])

  /* ---------------- running the script ---------------- */

  const runStep = useCallback(
    async (id, ans) => {
      // These aren't questions, so they are handled before the lookup.
      if (id === 'results') return showResults(ans)
      if (id === 'showcase') return showShowcase(ans)
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

      await say({
        text: typeof step.ask === 'function' ? step.ask(ans) : step.ask,
        options: typeof step.options === 'function' ? step.options(ans) : step.options,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say],
  )

  // Buy / invest: real listings that fit, topped up with curated picks of the
  // same kind so the visitor always has something concrete to look at.
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

      const real = rankByKind(list, ans.kind).slice(0, 6)
      const picks = real.length < 3 ? showcaseFor(ans, 3 - real.length + (real.length ? 0 : 1)) : []
      const cards = [...real, ...picks]
      const noun = nounFor(ans)
      const where = ans.locality && ans.locality !== 'Anywhere in Jaipur' ? ` in ${ans.locality}` : ' in Jaipur'

      const headline = !real.length
        ? `Here are ${noun}${where} our team can arrange for you:`
        : widened
          ? `Nothing sits exactly in ${ans.budget}, but here are close ${noun}${where}:`
          : ans.intent === 'invest'
            ? `These are income-ready ${noun} in your range:`
            : `Here ${cards.length === 1 ? 'is a match' : `are ${cards.length} ${noun}`}${where} for you:`

      await say({ text: headline, results: cards })
      await runStep('offer_call', ans)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say],
  )

  // Build / manage: show what comparable properties look like, then take
  // the callback details.
  const showShowcase = useCallback(
    async (ans) => {
      const cards = showcaseFor(ans, 3)
      if (cards.length) {
        await say({
          text:
            ans.intent === 'build'
              ? `For inspiration, here are ${nounFor(ans)} we have delivered and listed in Jaipur:`
              : `Here are ${nounFor(ans)} like yours that we currently manage in Jaipur:`,
          results: cards,
        })
      }
      return runStep('lead', ans)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say],
  )

  const welcome = useCallback(
    () => say({ text: `${greeting()}! I’m your My World City guide — tell me what you need and I’ll find it.` }, 400),
    [say],
  )

  // first run
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await welcome()
      if (!cancelled) await runStep('start', {})
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choose = async (option) => {
    push({ from: 'user', text: option.label })
    // some answers are plain links out of the chat (e.g. "Open List Property")
    if (option.href) { window.location.assign(option.href); return }
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
    setItems((c) => c.map((m) => (m.options ? { ...m, options: null } : m)))

    if (/^(hi|hello|hey|start over|restart)\b/i.test(text)) {
      setAnswers({})
      return runStep('start', {})
    }

    // a question ("how to buy industrial land?") gets a guide, not a search
    const guide = answerQuestion(text)
    if (guide) return say({ ...guide }, 700)

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
      await welcome()
      await runStep('start', {})
    })()
  }

  const chips = summaryRows(answers)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-20px_rgba(8,26,51,0.45)] ring-1 ring-slate-200">
      {/* header */}
      <div data-dark className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#0b3f80] via-[#1f5fbf] to-[#22b9cb] px-4 py-3.5 text-white sm:px-5">
        {/* soft colour blooms */}
        <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <span className="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-[#ef8f2a]/30 blur-2xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20 ring-2 ring-white/40">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold">My World City Help Desk</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/85">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                Online · replies instantly
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={reset} aria-label="Start over"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/20">
              <RotateCw className="h-[18px] w-[18px]" />
            </button>
            <button onClick={onClose} aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/20">
              <X className="h-[19px] w-[19px]" />
            </button>
          </div>
        </div>
      </div>

      {/* what we know so far */}
      {chips.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b border-slate-100 bg-white px-4 py-2.5 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
          <span className="mr-1 shrink-0 text-[11.5px] font-bold uppercase tracking-wide text-navy-900">Your brief</span>
          {chips.map(([k, v], i) => (
            <span
              key={k}
              style={{ '--c': CHIP_COLORS[i % CHIP_COLORS.length] }}
              className="mwc-chip-in shrink-0 rounded-full bg-[color-mix(in_srgb,var(--c)_12%,white)] px-3 py-1 text-[12px] font-bold text-[color:var(--c)]"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      {/* conversation */}
      <div ref={scroller} className="mwc-scrollbar relative flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-[#eef4ff] via-white to-[#fff5ea] px-4 py-4 sm:px-5">
        {items.map((m, i) =>
          m.from === 'user' ? (
            <div key={i} data-msg className="mwc-msg-in">
              <p className="mb-1 text-right text-[11.5px] text-slate-500">You · {m.at}</p>
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-3xl rounded-br-lg bg-gradient-to-r from-[#0b3f80] to-[#1f5fbf] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm">
                  {m.text}
                </p>
              </div>
            </div>
          ) : (
            <BotMessage key={i} m={m} onChoose={choose} onLead={submitLead} />
          ),
        )}

        {typing && (
          <div className="flex items-end gap-2.5">
            <Avatar />
            <div className="inline-flex rounded-3xl rounded-bl-lg bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
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
            placeholder="Try “villa in Jagatpura under 1 cr”…"
            aria-label="Type your message"
            className="min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-5 py-3 text-[16px] text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white sm:text-[14px]"
          />
          <button type="submit" aria-label="Send"
            className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1f5fbf] to-[#22b9cb] text-white shadow-sm transition hover:brightness-110 disabled:opacity-40"
            disabled={!draft.trim()}>
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="pb-1 pt-1.5 text-right text-[11px] text-slate-400">My World City Assistant</p>
      </div>
    </div>
  )
}

function Avatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1f5fbf] to-[#22b9cb] text-white shadow-sm">
      <Sparkles className="h-4 w-4" />
    </span>
  )
}

/* ---------------- one message from the assistant ---------------- */

function BotMessage({ m, onChoose, onLead }) {
  return (
    <div data-msg data-results={m.results || m.steps ? '' : undefined} className="mwc-msg-in flex items-start gap-2.5">
      <Avatar />
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11.5px] text-slate-500">My World City · {m.at}</p>
        <div className={`rounded-3xl rounded-tl-lg bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100 ${m.results ? 'block' : 'inline-block max-w-full sm:max-w-[92%]'}`}>
          {m.text && <p className="text-[14.5px] leading-relaxed text-navy-900">{m.text}</p>}

          {m.options && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {m.options.map((o) => {
                const { Icon, color } = lookFor(o.label)
                return (
                  <button
                    key={o.label}
                    onClick={() => onChoose(o)}
                    style={{ '--c': color }}
                    className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[color:var(--c)] bg-[color-mix(in_srgb,var(--c)_9%,white)] px-4 py-2.5 text-[13.5px] font-bold text-[color:var(--c)] transition hover:-translate-y-0.5 hover:bg-[color:var(--c)] hover:text-white hover:shadow-md"
                  >
                    <Icon className="h-4 w-4 shrink-0" /> {o.label}
                  </button>
                )
              })}
            </div>
          )}

          {m.steps && (
            <ol className="mt-3 space-y-2">
              {m.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-navy-900">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1f5fbf] to-[#22b9cb] text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          )}

          {m.results && <ResultRow items={m.results} />}
          {m.summary && <SummaryTable rows={m.summary} />}
          {m.lead && <LeadForm onSubmit={onLead} />}
        </div>
      </div>
    </div>
  )
}

/* ---------------- property results ---------------- */

// A swipeable row of cards — two or three are in view at once in the panel.
function ResultRow({ items }) {
  return (
    <div className="mwc-scrollbar -mx-1 mt-3.5 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
      {items.map((p, i) => {
        const color = CATEGORY_COLOR[p.tag] || BRAND
        return (
          <article
            key={p.id || `${p.title}-${i}`}
            style={{ '--c': color, animationDelay: `${i * 90}ms` }}
            className="mwc-card-in group w-[218px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_4px_18px_-10px_rgba(8,26,51,0.4)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_12px_26px_-12px_rgba(8,26,51,0.45)]"
          >
            <div className="relative overflow-hidden">
              <img src={p.img} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-[color:var(--c)] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white shadow-sm">
                {p.type || p.tag}
              </span>
              {!p.sample && (
                <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10.5px] font-bold text-emerald-700 shadow-sm">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <div className="p-3.5">
              <h4 className="truncate text-[15px] text-navy-900">{p.title}</h4>
              <p className="mt-1 flex items-center gap-1 truncate text-[12.5px] text-slate-600">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--c)]" /> {p.address || p.loc}
              </p>
              <p className="mt-1.5 truncate text-[12.5px] font-bold text-navy-900">
                {p.availability || 'Available'}
                {(p.detail || p.size) && <span className="font-normal text-slate-600"> · {p.detail || p.size}</span>}
              </p>
              <Link
                href={p.href || `/property/${p.slug}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--c)_10%,white)] py-2 text-[12.5px] font-bold text-[color:var(--c)] transition hover:bg-[color:var(--c)] hover:text-white"
              >
                {p.sample ? 'See similar' : 'View details'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SummaryTable({ rows }) {
  if (!rows.length) return null
  return (
    <dl className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-4 bg-white px-3.5 py-2.5">
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
    <form onSubmit={submit} className="mt-3.5 max-w-sm space-y-3">
      <Field label="Your name" bad={nameBad}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
          autoComplete="name" className="w-full bg-transparent px-4 py-2.5 text-[14px] text-navy-900 outline-none placeholder:text-slate-400" />
      </Field>
      {nameBad && <p className="text-[12px] font-medium text-rose-600">Enter your name</p>}

      <Field label="Mobile number" bad={phoneBad}>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit number" inputMode="numeric" autoComplete="tel"
          className="w-full bg-transparent px-4 py-2.5 text-[14px] text-navy-900 outline-none placeholder:text-slate-400" />
      </Field>
      {phoneBad && <p className="text-[12px] font-medium text-rose-600">Enter a valid 10-digit Indian mobile number</p>}

      <button type="submit" disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0b3f80] to-[#1f5fbf] py-3 text-[14.5px] font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60">
        <PhoneCall className="h-4 w-4" /> Request callback
      </button>
    </form>
  )
}

// Outlined box with the label notched into the top border.
function Field({ label, bad, children }) {
  return (
    <div className={`relative rounded-full border ${bad ? 'border-rose-500' : 'border-slate-300'}`}>
      <span className={`absolute -top-[9px] left-4 bg-white px-1 text-[11px] font-medium ${bad ? 'text-rose-600' : 'text-slate-500'}`}>
        {label}
      </span>
      {children}
    </div>
  )
}
