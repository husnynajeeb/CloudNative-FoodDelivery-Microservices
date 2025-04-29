import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Restaurant'
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
  },
  image: {
    type: String // Stores path like '/uploads/filename.jpg'
  }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);