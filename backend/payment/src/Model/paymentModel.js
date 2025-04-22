import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  currency: String,
  paymentIntentId: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
