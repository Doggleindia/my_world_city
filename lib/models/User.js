import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true }, // 10-digit
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatar: { type: String },
    roles: {
      type: [String],
      enum: ['buyer', 'owner', 'dealer', 'expert', 'admin'],
      default: ['buyer'],
    },
    verified: { type: Boolean, default: false }, // phone verified
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
