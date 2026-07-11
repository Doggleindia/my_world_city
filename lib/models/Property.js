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
    slug: { type: String, required: true, unique: true },
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
    flagged: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: false },
    rera: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    // Extended detail captured / edited from the admin property editor.
    subType: { type: String },
    address: { type: String },
    pincode: { type: String },
    reraNumber: { type: String },
    listedDate: { type: Date },
    details: {
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      balconies: { type: Number },
      parking: { type: String },
      totalFloors: { type: Number },
      floorNumber: { type: Number },
      facing: { type: String },
      age: { type: String },
      possession: { type: String },
      furnishing: { type: String },
      ownership: { type: String },
      titleStatus: { type: String },
      carpetArea: { type: String },
      builtUpArea: { type: String },
      superArea: { type: String },
      priceSqft: { type: Number },
      booking: { type: Number },
      maintenance: { type: Number },
      negotiable: { type: Boolean, default: false },
    },
    // Overflow for admin-wizard fields without a first-class column
    // (owner PAN/type, video/floorplan/legal-doc urls, contact + visibility prefs).
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

// Text search across title + locality.
PropertySchema.index({ title: 'text', 'location.locality': 'text' })

// Covers the primary catalog query: active listings filtered by category +
// listingType and sorted/ranged by price. Supports the common browse path.
PropertySchema.index({ status: 1, category: 1, listingType: 1, price: 1 })
// Sort-by-popularity within active listings.
PropertySchema.index({ status: 1, views: -1 })
// Boolean facets are frequently combined with status in the listing filters.
PropertySchema.index({ status: 1, featured: 1 })

export default mongoose.models.Property || mongoose.model('Property', PropertySchema)
