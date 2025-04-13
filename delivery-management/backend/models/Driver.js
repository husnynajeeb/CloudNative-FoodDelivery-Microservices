const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  isAvailable: { type: Boolean, default: true },
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
});

driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);