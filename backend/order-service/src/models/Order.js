import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [
    {
      name: String,
      foodId: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street: String,
    city: String,
    zip: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);