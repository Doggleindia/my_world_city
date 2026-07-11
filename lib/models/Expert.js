import mongoose from 'mongoose'

const QualificationSchema = new mongoose.Schema(
  { icon: String, title: String, desc: String, bg: String },
  { _id: false },
)
const ProjectSchema = new mongoose.Schema(
  { year: String, title: String, meta: String, desc: String, img: String },
  { _id: false },
)
const StatSchema = new mongoose.Schema(
  { value: String, label: String },
  { _id: false },
)

const ExpertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    initials: { type: String },
    role: { type: String },
    cat: { type: String, index: true }, // Architecture, Legal, ...
    tag: { type: String },
    specialty: { type: String },
    photo: { type: String },
    location: { type: String },
    experience: { type: String },
    languages: { type: String },
    intro: { type: String },
    stats: [StatSchema],
    about: [String],
    quickFacts: [String],
    worksOn: [String],
    qualifications: [QualificationSchema],
    projects: [ProjectSchema],
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    // --- Admin directory / onboarding fields ---
    status: { type: String, enum: ['draft', 'pending', 'verified', 'suspended'], default: 'pending', index: true },
    featured: { type: Boolean, default: false },
    cases: { type: Number, default: 0 }, // completed engagements
    avgResponseHours: { type: Number, default: 4 },
    ratingCount: { type: Number, default: 0 },
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    serviceAreas: [String],
    specialties: [String],
    portfolio: [String],
    // Overflow for onboarding-wizard fields (firm type, verification docs,
    // credentials, availability, pricing, commission, notification prefs, etc.).
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

export default mongoose.models.Expert || mongoose.model('Expert', ExpertSchema)
