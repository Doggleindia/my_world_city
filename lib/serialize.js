// Convert a Mongoose lean() doc (or array) into a plain, client-safe object:
// ObjectIds -> strings, Dates -> ISO strings, drop __v.
export function serialize(doc) {
  return JSON.parse(JSON.stringify(doc, replacer))
}

function replacer(key, value) {
  if (key === '__v') return undefined
  return value
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
