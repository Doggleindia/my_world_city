import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // 10-digit
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatar: { type: String },
    // scrypt hash ("salt:hash"). Owners get one when they first list a property.
    passwordHash: { type: String },
    // True while the account is still on its auto-generated temporary password.
    mustChangePassword: { type: Boolean, default: false },
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
