import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
  items: [
    {
      name: String,
      foodId: String,
      quantity: Number,
      price: Number,
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveryAddress: {
    street: String,
    city: String,
    zip: String
  }
});

export default mongoose.model('Order', orderSchema);
