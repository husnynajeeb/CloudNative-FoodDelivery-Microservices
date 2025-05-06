import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' }
});

export default mongoose.model('Customer', customerSchema);
