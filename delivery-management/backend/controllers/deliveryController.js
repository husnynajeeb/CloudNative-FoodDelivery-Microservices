const axios = require('axios');
const polyline = require('@mapbox/polyline');
const Driver = require('../models/Driver');
const Order = require('../models/Order');

exports.getDrivers = async (req, res) => {
  const drivers = await Driver.find();
  res.json(drivers);
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};

exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const driver = await Driver.findById(order.driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const [driverLng, driverLat] = driver.location.coordinates;
    const [orderLng, orderLat] = order.deliveryLocation.coordinates;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${driverLat},${driverLng}&destination=${orderLat},${orderLng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);

    const route = response.data.routes[0];
    if (!route || !route.legs?.length) {
      return res.status(500).json({ message: 'No route found' });
    }

    const eta = route.legs[0].duration.text;
    const points = route.overview_polyline?.points;
    if (!points) return res.status(500).json({ message: 'No polyline found' });

    const decoded = polyline.decode(points); // [lat, lng]
    const routeCoords = decoded.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    res.json({
      driverLocation: driver.location,
      status: order.status,
      eta,
      route: routeCoords,
    });
  } catch (err) {
    console.error('Track order failed:', err.message);
    res.status(500).json({ message: 'Failed to track order' });
  }
};

exports.createDriver = async (req, res) => {
  const driver = await Driver.create(req.body);
  req.io.emit('driverCreated', driver);
  res.status(201).json(driver);
};

async function simulateDriverMovement(driverId, orderId, routeCoords, io) {
  for (let i = 0; i < routeCoords.length; i++) {
    const [lng, lat] = routeCoords[i]; // [lng, lat]

    const driver = await Driver.findById(driverId);
    if (!driver) break;

    driver.location.coordinates = [lng, lat];
    await driver.save();

    io.emit('driverLocationUpdated', {
      driverId: driver._id.toString(),
      coordinates: [lng, lat],
    });

    // Emit live ETA updates only while the order isn't delivered
    const order = await Order.findById(orderId);
    if (order && order.status !== 'delivered') {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lng}&destination=${order.deliveryLocation.coordinates[1]},${order.deliveryLocation.coordinates[0]}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const res = await axios.get(url);
      const eta = res.data.routes[0]?.legs[0]?.duration?.text;

      if (eta) {
        io.emit('etaUpdated', { orderId, eta });
      }
    }

    await new Promise((res) => setTimeout(res, 1500));
  }

  // ✅ Mark order as delivered and update driver
  const order = await Order.findById(orderId);
  if (order) {
    order.status = 'delivered';
    await order.save();
    io.emit('orderDelivered', { orderId: order._id });
  }

  const driver = await Driver.findById(driverId);
  if (driver) {
    driver.isAvailable = true;
    driver.currentOrderId = null;
    await driver.save();

    // Emit final driver location when delivery is completed
    io.emit('driverLocationUpdated', {
      driverId: driver._id.toString(),
      coordinates: driver.location.coordinates,
    });
  }
}

exports.assignDriver = async (req, res) => {
  const { customerId, deliveryLocation } = req.body;
  const io = req.io;

  const nearbyDriver = await Driver.findOne({
    isAvailable: true,
    location: {
      $near: {
        $geometry: deliveryLocation,
        $maxDistance: 10000
      },
    },
  });

  if (!nearbyDriver) return res.status(404).json({ message: 'No drivers available nearby' });

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${nearbyDriver.location.coordinates[1]},${nearbyDriver.location.coordinates[0]}&destination=${deliveryLocation.coordinates[1]},${deliveryLocation.coordinates[0]}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const response = await axios.get(url);
  const route = response.data.routes[0];

  const decoded = polyline.decode(route.overview_polyline.points);
  const routeCoords = decoded.map(([lat, lng]) => [lng, lat]);

  const newOrder = await Order.create({
    customerId,
    deliveryLocation,
    status: 'assigned',
    driverId: nearbyDriver._id,
    route: routeCoords,
  });

  nearbyDriver.isAvailable = false;
  nearbyDriver.currentOrderId = newOrder._id;
  await nearbyDriver.save();

  io.emit('orderAssigned', { order: newOrder });
  res.status(201).json({ order: newOrder });

  simulateDriverMovement(nearbyDriver._id, newOrder._id, routeCoords, io);
};
