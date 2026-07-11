import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Lead from '@/lib/models/Lead'
import { handler, ok, requireRole } from '@/lib/api'

// GET /api/admin/localities — property + enquiry stats grouped by locality.
export const GET = handler(async () => {
  await requireRole('admin')
  await dbConnect()

  const [byProperty, byEnquiry] = await Promise.all([
    Property.aggregate([
      { $match: { 'location.locality': { $ne: null } } },
      {
        $group: {
          _id: '$location.locality',
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          views: { $sum: '$views' },
          avgPrice: { $avg: '$price' },
          lat: { $first: '$location.lat' },
          lng: { $first: '$location.lng' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 50 },
    ]),
    Lead.aggregate([
      { $match: { propertyId: { $ne: null } } },
      { $lookup: { from: 'properties', localField: 'propertyId', foreignField: '_id', as: 'p' } },
      { $unwind: '$p' },
      { $group: { _id: '$p.location.locality', enquiries: { $sum: 1 } } },
    ]),
  ])

  const enqMap = new Map(byEnquiry.map((e) => [e._id, e.enquiries]))
  const items = byProperty
    .filter((r) => r._id)
    .map((r) => ({
      locality: r._id,
      total: r.total,
      active: r.active,
      views: r.views || 0,
      enquiries: enqMap.get(r._id) || 0,
      avgPrice: r.avgPrice || null,
      lat: r.lat ?? null,
      lng: r.lng ?? null,
    }))

  return ok({ items })
})
