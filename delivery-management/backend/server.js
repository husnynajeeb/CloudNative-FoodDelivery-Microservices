import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';

import deliveryRoutes from './routes/deliveryRoutes.js';
import Driver from './models/Driver.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use((req, res, next) => { req.io = io; next(); });
app.use(cors());
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO Real-time Location Handling
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('updateDriverLocation', async (driverLocation) => {
    const { driverId, coordinates } = driverLocation;

    if (!driverId || !coordinates || coordinates.length !== 2) {
      console.log('❌ Invalid location update payload');
      return;
    }

    try {
      await Driver.findByIdAndUpdate(driverId, {
        location: {
          latitude: coordinates[0],
          longitude: coordinates[1],
        },
      });

      socket.broadcast.emit('driverLocationUpdated', driverLocation);
      console.log('📡 Driver location updated:', driverLocation);
    } catch (err) {
      console.error('❌ Error updating driver location:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

const PORT = process.env.PORT || 5003;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
