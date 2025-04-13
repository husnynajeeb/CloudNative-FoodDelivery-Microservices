const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: String,
  deliveryLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
  },
  status: { type: String, enum: ['pending', 'assigned', 'delivered'], default: 'pending' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
});

module.exports = mongoose.model('Order', orderSchema);
