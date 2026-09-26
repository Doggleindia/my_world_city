// Owners type the price freely on the listing wizard: some enter "₹65 L",
// others just "5500000". Show both the same way.
//
//   "₹65 L"    -> "₹65 L"      (already written out — left alone)
//   "5500000"  -> "₹55 L"
//   "12500000" -> "₹1.25 Cr"
export function formatPrice(label) {
  if (label === null || label === undefined) return null
  const s = String(label).trim()
  if (!s) return null

  // Anything other than digits, spaces, commas and dots means the owner has
  // already written it in words or with a currency symbol.
  if (/[^\d\s,.]/.test(s)) return s

  const n = Number(s.replace(/[,\s]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return s

  if (n >= 10000000) return `₹${Number((n / 10000000).toFixed(2))} Cr`
  if (n >= 100000) return `₹${Number((n / 100000).toFixed(2))} L`
  return `₹${n.toLocaleString('en-IN')}`
}
