import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, default: 'delivery' },
    profilePicture: { type: String, default: "" },
    address: { type: String, default: "" },
    vehicleType: { type: String, default: "" },
    vehiclePlate: { type: String, default: "" },

    // ✅ GeoJSON location field with default coordinates
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

driverSchema.index({ location: '2dsphere' });

export default mongoose.model('Driver', driverSchema);
