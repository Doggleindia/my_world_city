// Short, readable numbers for cards: 980, 1.2k, 15k. Pure — safe in the browser.
export function formatViews(n) {
  if (!n) return '0'
  if (n < 1000) return String(n)
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return Math.round(n / 1000) + 'k'
}
