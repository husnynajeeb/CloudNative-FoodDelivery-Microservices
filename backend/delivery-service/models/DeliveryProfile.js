import mongoose from "mongoose";

const deliveryProfileSchema = new mongoose.Schema(
    {
      authDriverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: "Driver", // still references Driver _id from auth service
      },
  
      status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available',
      },
  
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          required: true,
          default: [0.0, 0.0],
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