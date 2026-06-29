import mongoose from 'mongoose'

const SavedPropertySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  },
  { timestamps: true },
)

// A user can save a given property only once.
SavedPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true })

export default mongoose.models.SavedProperty ||
  mongoose.model('SavedProperty', SavedPropertySchema)
