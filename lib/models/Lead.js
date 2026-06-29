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
    // Workflow
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema)
