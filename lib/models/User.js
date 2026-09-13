import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    // Email is the login identity — it is what the one-time code is sent to.
    email: { type: String, required: true, unique: true, sparse: true, trim: true, lowercase: true },
    // Contact number. Optional, and never used to log in; collected on the
    // listing wizard and enquiry forms so buyers can be called back.
    phone: { type: String, trim: true, index: true },
    name: { type: String, trim: true },
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
    // Captured on the listing wizard: developer / agent / owner.
    profession: { type: String, enum: ['developer', 'agent', 'owner'] },
    verified: { type: Boolean, default: false }, // email verified
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
