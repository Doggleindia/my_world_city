// Convert a Mongoose lean() doc (or array) into a plain, client-safe object:
// ObjectIds -> strings, Dates -> ISO strings, drop __v and any `omit` keys.
// NOTE: this is a convenience serializer, not a security boundary — routes that
// return other users' data must still `.select()` the fields they intend to expose.
export function serialize(doc, omit = []) {
  const drop = new Set(['__v', ...omit])
  return JSON.parse(JSON.stringify(doc, (key, value) => (drop.has(key) ? undefined : value)))
}

// Map a property document to the shape the UI cards/pages expect.
import { formatPrice } from '@/lib/formatPrice'

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
    priceLabel: formatPrice(p.priceLabel),
    verified: !!p.verified,
    featured: !!p.featured,
    premium: !!p.premium,
    views: p.views || 0,
    href: `/property/${p.slug}`,
    // what the listing card prints under the photo
    // owners sometimes type "Sitapura, Jaipur" as the locality — don't print the city twice
    address: (() => {
      const loc = (p.location?.locality || '').trim(), city = (p.location?.city || '').trim()
      if (loc && city && loc.toLowerCase().includes(city.toLowerCase())) return loc
      return [loc, city].filter(Boolean).join(', ')
    })(),
    availability: p.listingType === 'rent' ? 'Leasing now' : 'For sale',
    type: p.category || '',
    size: p.area || '',
  }
}
