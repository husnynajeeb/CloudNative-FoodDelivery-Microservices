import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, default: 'delivery' },
    profilePicture: { type: String, default: "" },
    address: {
      street: { type: String },
      city: { type: String },
      country: { type: String, default: "Sri Lanka" },
    },
    vehicleType: { type: String, default: "" },
    vehiclePlate: { type: String, default: "" },

    location: {
      type: { type: String, default: 'Point' },
      coordinates: {
        type: [Number],
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
