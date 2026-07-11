// Post a lead to /api/leads and return its reference id. Never throws — if the
// API is unreachable (e.g. no DB configured in dev) it returns a locally
// generated ref so the success UI still works.
export async function submitLead(payload) {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) return data.refId
  } catch {
    /* fall through to the local ref */
  }
  const year = new Date().getFullYear()
  return `MWC-${year}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
}
