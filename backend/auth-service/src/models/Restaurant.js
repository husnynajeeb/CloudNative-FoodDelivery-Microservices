import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  businessName: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'restaurant' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    default: [0, 0],
  },
});

export default mongoose.model('Restaurant', restaurantSchema);