import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import deliveryRoutes from '../routes/deliveryRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // replace with your frontend origin for production
  },
});

app.use(cors());
app.use(express.json());

// Attach io instance to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/delivery', deliveryRoutes);

// Connect to DB
connectDB();

// Start server
const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket`);
});

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Listen for location updates from driver
  socket.on('updateDriverLocation', (data) => {
    console.log('Driver location update received:', data);

    // Broadcast updated location to all clients (could be optimized later with rooms)
    io.emit('driverLocationUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
