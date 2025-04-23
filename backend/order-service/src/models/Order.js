import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryProfile',
    default: null,
  },
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
    enum: ['pending', 'accepted', 'preparing', 'dispatched', 'ready_for_pickup', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // 👉 Separated delivery address (text) and delivery location (geo)
  deliveryAddress: {
    street: String,
    city: String,
    zip: String
  },

   location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0.0, 0.0]
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add geospatial index for location queries
orderSchema.index({ location: '2dsphere' });

export default mongoose.model('Order', orderSchema);
