import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    plan: { type: String, enum: ['featured', 'premium', 'dealer'], required: true },
    amount: { type: Number, required: true }, // INR (paise stored as integer rupees here)
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
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
