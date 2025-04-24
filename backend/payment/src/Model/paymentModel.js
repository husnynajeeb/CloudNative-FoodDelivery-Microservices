import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Basic international phone number validation
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  amount: {
    type: Number,
    required: true,
    min: [0.5, 'Amount must be at least 0.50'] // Minimum payment amount
  },
  currency: {
    type: String,
    required: true,
    enum: ['lkr', 'eur', 'usd'], // Supported currencies
    default: 'lkd'
  },
  paymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
