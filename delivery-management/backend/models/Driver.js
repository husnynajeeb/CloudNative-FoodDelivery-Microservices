import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {  // New field for name
    type: String,
    required: true,  // If the name is required
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available',
  },
  currentLocation: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  rating: { type: Number, default: 5.0 },
  deliveriesCompleted: { type: Number, default: 0 },
}, {
  timestamps: true
});

// ✅ Correctly create 2dsphere index on `currentLocation`
driverSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Driver', driverSchema);
