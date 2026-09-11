import Lead from '@/lib/models/Lead'

// How many enquiries each property has received. One aggregate for the whole
// page rather than a query per card.
export async function enquiryCountsFor(ids) {
  if (!ids?.length) return {}
  try {
    const rows = await Lead.aggregate([
      { $match: { propertyId: { $in: ids } } },
      { $group: { _id: '$propertyId', n: { $sum: 1 } } },
    ])
    return Object.fromEntries(rows.map((r) => [String(r._id), r.n]))
  } catch {
    return {} // never let a stats query break the listing
  }
}
