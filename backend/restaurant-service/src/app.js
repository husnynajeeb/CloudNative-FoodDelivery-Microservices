import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/restaurant-menu', menuRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Restaurant DB connected'))
  .catch(err => console.error('DB error:', err));

app.listen(process.env.PORT, () =>
  console.log(`Restaurant Service running on port ${process.env.PORT}`)
);