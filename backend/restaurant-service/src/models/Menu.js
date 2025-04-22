import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant' // Assuming you store restaurant records here or from auth-db
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Main', 'Drinks', 'Dessert', 'Other'],
    default: 'Other'
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);