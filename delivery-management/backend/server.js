const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const deliveryRoutes = require('./routes/deliveryRoutes');
const Driver = require('./models/Driver');

dotenv.config();

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use((req, res, next) => { req.io = io; next(); });
app.use(cors());
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('🟢 A user connected');
  
  socket.on('updateDriverLocation', async (driverLocation) => {
    console.log('Emitting driver location:', driverLocation);  // Debugging log
    socket.broadcast.emit('driverLocationUpdated', driverLocation);
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// Simulate driver location updates every 5 seconds
// setInterval(async () => {
//   const driver = await Driver.findOne();
//   if (!driver) return;

//   // Fake movement
//   let [lng, lat] = driver.location.coordinates;
//   lng += 0.0001; // Move east
//   lat += 0.00005; // Move north

//   driver.location.coordinates = [lng, lat];
//   await driver.save();

//   // Emit new location
//   io.emit('driverLocationUpdated', {
//     driverId: driver._id.toString(),
//     coordinates: [lng, lat],
//   });
// }, 5000);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
