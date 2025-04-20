// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "restaurant", "admin", "delivery"],
    default: "customer",
  },
  profilePicture: { type: String, default: "" },
  address: { type: String, default: "" },
  vehicleType: { type: String, default: "" },
  vehiclePlate: { type: String, default: "" },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true,
    },
  }
});

userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);
