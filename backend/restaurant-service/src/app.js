import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import menuRoutes from './routes/menuRoutes.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// Serve static files using the correct path
const uploadsPath = path.resolve(__dirname, '../public/uploads');
console.log('Serving static files from:', uploadsPath); // Debug log
app.use('/uploads', express.static(uploadsPath));
app.use('/api/restaurant-menu', menuRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Restaurant DB connected'))
  .catch(err => console.error('DB error:', err));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () =>
  console.log(`Restaurant Service running on port ${PORT}`)
);