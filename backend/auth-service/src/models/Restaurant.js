import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  businessName: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'restaurant' },
  image: { type: String, default: '' },  // New field for image URL
});

export default mongoose.model('Restaurant', restaurantSchema);