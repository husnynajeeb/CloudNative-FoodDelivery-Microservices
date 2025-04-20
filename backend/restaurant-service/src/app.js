 import express from 'express';
import cors from 'cors';
 import { connectDB } from './config/db.js';
      import dotenv from 'dotenv';
      import orderRoutes from './routes/orderRoutes.js';
      import restaurantRoutes from './routes/restaurantRoutes.js';
      import authRoutes from './routes/authRoutes.js';

      dotenv.config();

      const app = express();

      app.use(cors());
      app.use(express.json());

      app.use('/api/order', orderRoutes);
      app.use('/api/restaurant', restaurantRoutes);
      app.use('/api/auth', authRoutes);

      connectDB();

      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    