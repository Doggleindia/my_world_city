import { dbConnect } from '@/lib/db'
import Lead from '@/lib/models/Lead'
import Property from '@/lib/models/Property'
import Expert from '@/lib/models/Expert'
import User from '@/lib/models/User' // registered so populate('ownerId') resolves
import { handler, ok, requireRole } from '@/lib/api'

void User

// Lead types → the dashboard's business categories. Adjust here when a richer
// enquiry taxonomy exists; the chart + legend read straight from this mapping.
const CATEGORY_OF = {
  enquiry: 'property',
  visit: 'build',
  service: 'operate',
  callback: 'invest',
  expert: 'invest',
}
const CATEGORIES = ['property', 'build', 'operate', 'invest']

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// GET /api/admin/stats?days=1|7|30 — everything the admin dashboard needs.
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const days = [1, 7, 30].includes(Number(new URL(req.url).searchParams.get('days'))) ? Number(new URL(req.url).searchParams.get('days')) : 1
  const today = startOfToday()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 5) // 6 day-columns including today
  const rangeStart = days === 1 ? today : new Date(Date.now() - days * 864e5)
  const prevStart = new Date(rangeStart.getTime() - days * 864e5)

  const [
    enquiriesToday,
    rangeCount,
    prevCount,
    unassigned,
    liveProperties,
    pendingProperties,
    expertsOnboarded,
    expertsPending,
    byDayRaw,
    recentLeads,
    pendingDocs,
    localityByEnquiry,
    localityByListing,
    respAgg,
    statusAgg,
    typeAgg,
  ] = await Promise.all([
    Lead.countDocuments({ createdAt: { $gte: today } }),
    Lead.countDocuments({ createdAt: { $gte: rangeStart } }),
    Lead.countDocuments({ createdAt: { $gte: prevStart, $lt: rangeStart } }),
    Lead.countDocuments({ status: 'new' }),
    Property.countDocuments({ status: 'active' }),
    Property.countDocuments({ status: 'pending' }),
    Expert.countDocuments({}),
    Expert.countDocuments({ verified: { $ne: true } }),
    Lead.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' },
          count: { $sum: 1 },
        },
      },
    ]),
    Lead.find({ status: 'new' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('propertyId', 'location.locality title')
      .lean(),
    Property.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('ownerId', 'name')
      .lean(),
    Lead.aggregate([
      { $match: { propertyId: { $ne: null } } },
      { $lookup: { from: 'properties', localField: 'propertyId', foreignField: '_id', as: 'p' } },
      { $unwind: '$p' },
      { $group: { _id: '$p.location.locality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Property.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location.locality', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    // Avg first-response time: how long leads sat before leaving 'new'.
    Lead.aggregate([
      { $match: { status: { $ne: 'new' } } },
      { $project: { diff: { $subtract: ['$updatedAt', '$createdAt'] } } },
      { $group: { _id: null, avg: { $avg: '$diff' }, n: { $sum: 1 } } },
    ]),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
  ])

  // --- Enquiries-by-type, one stacked column per weekday for the last 6 days ---
  const dayMap = new Map()
  for (const row of byDayRaw) {
    const key = row._id.day
    const bucket = dayMap.get(key) || { property: 0, build: 0, operate: 0, invest: 0 }
    const cat = CATEGORY_OF[row._id.type] || 'property'
    bucket[cat] += row.count
    dayMap.set(key, bucket)
  }
  const enquiriesByDay = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(weekAgo)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const bucket = dayMap.get(key) || { property: 0, build: 0, operate: 0, invest: 0 }
    enquiriesByDay.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), ...bucket })
  }

  // --- Recent activity (most recent new enquiries) ---
  const recentActivity = recentLeads.slice(0, 4).map((l) => ({
    kind: 'enquiry',
    title: `New Enquiry: ${l.propertyId?.title || l.name}`,
    subtitle: `${l.name} • ${timeAgo(l.createdAt)}`,
  }))

  // --- Unassigned enquiries preview ---
  const unassignedEnquiries = recentLeads.slice(0, 3).map((l) => ({
    id: String(l._id),
    name: l.name,
    type: l.type,
    locality: l.propertyId?.location?.locality || l.serviceKey || '—',
  }))

  // --- Pending approvals preview ---
  const pendingApprovals = pendingDocs.map((p) => ({
    id: String(p._id),
    title: p.title,
    submittedBy: p.ownerId?.name || 'Owner',
    img: p.gallery?.main || (p.gallery?.thumbs && p.gallery.thumbs[0]) || '',
    when: timeAgo(p.createdAt),
  }))

  // --- Top localities (prefer enquiry counts, fall back to live-listing counts) ---
  const fromEnquiry = localityByEnquiry.filter((r) => r._id)
  const source = fromEnquiry.length ? fromEnquiry : localityByListing.filter((r) => r._id)
  const topLocalities = source.map((r) => ({ locality: r._id, count: r.count }))
  const localityMetric = fromEnquiry.length ? 'Enquiries' : 'Listings'

  // --- Real metrics ---
  const avgResponseMs = respAgg[0]?.avg || 0
  const avgResponse = respAgg[0]?.n ? humanDuration(avgResponseMs) : null
  const rangeDelta = prevCount > 0 ? Math.round(((rangeCount - prevCount) / prevCount) * 100) : null

  const STATUS_LABELS = { new: 'New', contacted: 'Contacted', site_visit: 'Site Visit', qualified: 'Qualified', closed: 'Closed', cancelled: 'Cancelled' }
  const statusBreakdown = statusAgg.map((s) => ({ key: s._id, label: STATUS_LABELS[s._id] || s._id, count: s.count })).sort((a, b) => b.count - a.count)
  const typeBreakdown = typeAgg.map((s) => ({ key: s._id, count: s.count })).sort((a, b) => b.count - a.count)

  return ok({
    stats: {
      enquiriesToday,
      rangeCount,
      rangeDelta,
      days,
      unassigned,
      liveProperties,
      pendingProperties,
      expertsOnboarded,
      expertsPending,
      avgResponse,
    },
    categories: CATEGORIES,
    enquiriesByDay,
    recentActivity,
    unassignedEnquiries,
    pendingApprovals,
    topLocalities,
    localityMetric,
    statusBreakdown,
    typeBreakdown,
  })
})

function humanDuration(ms) {
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h < 48 ? `${h}h ${m}m` : `${Math.floor(h / 24)}d`
}

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
