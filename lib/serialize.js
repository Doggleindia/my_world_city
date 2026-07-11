// Convert a Mongoose lean() doc (or array) into a plain, client-safe object:
// ObjectIds -> strings, Dates -> ISO strings, drop __v and any `omit` keys.
// NOTE: this is a convenience serializer, not a security boundary — routes that
// return other users' data must still `.select()` the fields they intend to expose.
export function serialize(doc, omit = []) {
  const drop = new Set(['__v', ...omit])
  return JSON.parse(JSON.stringify(doc, (key, value) => (drop.has(key) ? undefined : value)))
}

// Map a property document to the shape the UI cards/pages expect.
export function toPropertyCard(p) {
  return {
    id: String(p._id),
    slug: p.slug,
    tag: (p.category || '').toUpperCase(),
    title: p.title,
    loc: p.location?.locality
      ? `${p.location.locality}${p.area ? ' — ' + p.area : ''}`
      : p.area || p.location?.city || '',
    img: p.gallery?.main || (p.gallery?.thumbs && p.gallery.thumbs[0]) || '',
    priceLabel: p.priceLabel || null,
    verified: !!p.verified,
    featured: !!p.featured,
    premium: !!p.premium,
    href: `/property/${p.slug}`,
  }
}
