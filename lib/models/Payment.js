import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    // Must stay in sync with the keys of PLANS in lib/plans.js.
    plan: { type: String, enum: ['featured', 'premium'], required: true },
    amount: { type: Number, required: true }, // INR (whole rupees; ×100 for Razorpay paise)
    currency: { type: String, default: 'INR' },
    // Razorpay order id is the natural key on verify — unique + sparse prevents a
    // duplicate order from settling twice; sparse so pre-order docs (no id) are allowed.
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, index: true },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
