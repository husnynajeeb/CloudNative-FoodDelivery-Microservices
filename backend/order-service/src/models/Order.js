import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null,
  },
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
    enum: ['pending', 'accepted', 'preparing', 'dispatched', 'READY_FOR_PICKUP', 'DELIVERED', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveryAddress: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
});

orderSchema.index({ deliveryAddress: '2dsphere' });

export default mongoose.model('Order', orderSchema);
