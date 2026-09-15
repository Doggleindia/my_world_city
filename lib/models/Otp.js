import mongoose from 'mongoose'

// One row per code request. The code itself is never stored — only a SHA-256
// hash — so a database leak can't be used to log in as anyone.
const OtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    // 'login' (sign-in / sign-up) or 'admin-reset' (forgotten console password).
    purpose: { type: String, enum: ['login', 'admin-reset'], default: 'login', index: true },
    codeHash: { type: String, required: true },
    // Signup details captured at step 1, applied to the account once verified.
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

// Mongo deletes expired codes on its own, so nothing accumulates.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema)
