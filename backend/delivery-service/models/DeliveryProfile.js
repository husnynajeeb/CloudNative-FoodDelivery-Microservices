import mongoose from "mongoose";

const deliveryProfileSchema = new mongoose.Schema(
  {
    authDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Driver",
    },

    phone: {
      type: String,
      required: true, // or optional if you want fallback logic
    },

    status: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },

    location: {
      type: { type: String, default: 'Point' },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    rating: { type: Number, default: 5.0 },
    deliveriesCompleted: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

deliveryProfileSchema.index({ location: '2dsphere' });

export default mongoose.model('DeliveryProfile', deliveryProfileSchema);
