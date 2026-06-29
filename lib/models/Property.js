import mongoose from 'mongoose'

const KeyDetailSchema = new mongoose.Schema(
  { l: String, v: String },
  { _id: false },
)
const AmenitySchema = new mongoose.Schema(
  { icon: String, label: String },
  { _id: false },
)
const DistanceSchema = new mongoose.Schema(
  { label: String, value: String },
  { _id: false },
)

const PropertySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['Residential', 'Commercial', 'Industrial', 'Farm & Agri'],
      required: true,
      index: true,
    },
    listingType: { type: String, enum: ['buy', 'rent'], default: 'buy', index: true },
    price: { type: Number }, // in INR
    priceLabel: { type: String }, // display, e.g. "₹40L – ₹1.2Cr"
    area: { type: String },
    location: {
      locality: { type: String, index: true },
      city: { type: String, default: 'Jaipur', index: true },
      lat: Number,
      lng: Number,
    },
    badges: [String],
    amenities: [AmenitySchema],
    gallery: {
      main: String,
      thumbs: [String],
    },
    photoCount: { type: Number, default: 0 },
    keyDetails: [[KeyDetailSchema]],
    distances: [DistanceSchema],
    description: { type: String },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'sold', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String },
    verified: { type: Boolean, default: false },
    rera: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Text search across title + locality.
PropertySchema.index({ title: 'text', 'location.locality': 'text' })

export default mongoose.models.Property || mongoose.model('Property', PropertySchema)
