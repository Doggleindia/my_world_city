import mongoose from 'mongoose'

// A verified service partner (law firm, architect studio, contractor, etc.) that
// admin routes service requests to.
const PartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Aligns with a service request's serviceKey (normalised): legal, architect,
    // interior, surveyor, contractor, vastu, solar, govt_liaison, building_material.
    category: { type: String, required: true, index: true },
    specialty: { type: String }, // e.g. "Property Law"
    experience: { type: Number }, // years
    locality: { type: String },
    adjacentLocalities: [String],
    teamSize: { type: Number },
    verified: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    cases: { type: Number, default: 0 },
    avgResponseHours: { type: Number, default: 4 },
    availability: { type: String, enum: ['now', 'hours', 'tomorrow'], default: 'now' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.Partner || mongoose.model('Partner', PartnerSchema)
