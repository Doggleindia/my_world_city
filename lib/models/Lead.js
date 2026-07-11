import mongoose from 'mongoose'

const LeadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['enquiry', 'visit', 'callback', 'service', 'expert'],
      required: true,
      index: true,
    },
    refId: { type: String, index: true }, // public reference e.g. MWC-2026-00042
    // Targets (whichever applies to the lead type)
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', index: true },
    serviceKey: { type: String },
    budget: { type: String }, // free-text budget range e.g. "₹15L – ₹25L"
    // Who created it (nullable — leads can come from logged-out visitors)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    // Contact details
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String },
    // Scheduling extras
    visitDate: { type: String },
    timeSlot: { type: String },
    preferredTime: { type: String },
    preferredDay: { type: String },
    // Workflow / sales pipeline. Service routing reuses: new = needs routing,
    // contacted = routed to a partner, closed = completed, cancelled = cancelled.
    status: {
      type: String,
      enum: ['new', 'contacted', 'site_visit', 'qualified', 'closed', 'cancelled'],
      default: 'new',
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Service routing: the partner this request was routed to.
    routedPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
    routedAt: { type: Date },
    // Expert requests: the expert this request was assigned to.
    assignedExpert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
    assignedAt: { type: Date },
  },
  { timestamps: true },
)

// The admin inbox and per-owner lead views list newest-first, optionally by status.
LeadSchema.index({ status: 1, createdAt: -1 })
LeadSchema.index({ createdAt: -1 })

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema)
