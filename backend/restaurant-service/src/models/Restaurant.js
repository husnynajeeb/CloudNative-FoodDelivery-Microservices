import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  menu: [
    {
      name: String,
      price: Number,
    },
  ],
});

restaurantSchema.index({ location: '2dsphere' });

export default mongoose.model('Restaurant', restaurantSchema);
