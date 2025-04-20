import Driver from '../models/Driver.js';
import axios from 'axios';
import mongoose from 'mongoose';

export const createDriver = async (req, res) => {
  const { userId, name , currentLocation, status, rating, deliveriesCompleted } = req.body;

  try {
    // Ensure the location is a GeoJSON Point
    const driverLocation = {
      type: 'Point',
      coordinates: currentLocation.coordinates || [0, 0] // Default to [0, 0] if no coordinates
    };

    // Create a new driver instance
    const driver = new Driver({
      userId,
      name,
      currentLocation: driverLocation, // Use structured location data
      status,
      rating,
      deliveriesCompleted,
    });

    // Save the driver in the database
    await driver.save();

    console.log('Saved Driver:', driver);  // Log the full driver object

    // Send success response
    res.status(201).json({ message: 'Driver created successfully', driver });
  } catch (err) {
    // Send error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};

// Update driver's location
export const updateLocation = async (req, res) => {
  const { coordinates } = req.body;
  const driverId = req.params.id;

  try {
    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        currentLocation: {
          type: 'Point',
          coordinates,
        },
      },
      { new: true }
    );

    // Emit to WebSocket
    req.io.emit('driverLocationUpdated', {
      driverId,
      coordinates,
    });

    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get current location of a driver
export const getDriverLocation = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver.currentLocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Change driver status
export const updateDriverStatus = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


/// POST /api/delivery/assign
export const assignDriverToOrder = async (req, res) => {
  const { orderId, deliveryCoordinates } = req.body;


  // Validate input
  if (!orderId || !deliveryCoordinates || !Array.isArray(deliveryCoordinates) || deliveryCoordinates.length !== 2) {
    return res.status(400).json({ error: 'Invalid orderId or delivery coordinates' });
  }

  try {
    // Find nearest available driver using geospatial query
    const driver = await Driver.findOne({
      status: 'available',
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: deliveryCoordinates,
          },
          $maxDistance: 50000, // max 50km, adjust as needed
        },
      },
    });

    if (!driver) {
      console.warn('⚠️ No available drivers near the location');
      return res.status(404).json({ message: 'No drivers available' });
    }

    console.log('✅ Found driver:', driver.userId);

    // Update order with driver ID in the order-service
    const orderUpdateResponse = await axios.put(
      `http://localhost:5001/api/order/${orderId}/assign-driver`,
      { driverId: driver.userId }
    );

    const updatedOrder = orderUpdateResponse.data?.order;

    if (!updatedOrder) {
      console.error('❌ Failed to update order with driver');
      return res.status(500).json({ error: 'Order service did not return updated order' });
    }

    console.log('📝 Order updated with driver:', updatedOrder._id);

    // Update driver status to 'busy'
    driver.status = 'busy';
    await driver.save();

    // Send successful response
    res.status(200).json({
      message: 'Driver assigned successfully',
      driver: {
        id: driver._id,
        name: driver.userId?.name || 'N/A',
      },
      order: updatedOrder,
    });

  } catch (err) {
    console.error('❌ Error assigning driver:', err.message);
    res.status(500).json({ error: 'Error assigning driver' });
  }
};


// controllers/deliveryController.js
export const getAssignedOrder = async (req, res) => {
  const driverId = req.user._id; // Assuming you're using authentication middleware
  console.log(driverId)
  try {
    const response = await axios.get(
      `http://localhost:5001/api/order/add`,
      { driverId }
    );
    console.log(response)
    // const order = await Order.findOne({ assignedDriver: driverId, status: 'OUT_FOR_DELIVERY' });
    if (!response) return res.status(404).json({ message: 'No assigned orders' });
    res.json(response); // Matches your frontend expecting an array
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching assigned order' });
  }
};


export const getDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;

    // Fetch the driver from the delivery service
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Fetch the user details from the auth-service using the userId
    const userId = driver.userId;
    let userName = 'Name not available';

    try {
      // Send request to the auth-service to get user details by userId
      const userResponse = await axios.get(`http://localhost:5000/api/auth/users/${userId}`);
      userName = userResponse.data.name;
    } catch (err) {
      console.error('Error fetching user data from auth service', err.message);
    }

    // Send back driver details including the user's name
    res.json({
      ...driver.toObject(),
      driverName: userName,
    });

  } catch (error) {
    console.error('Error in getDriverById:', error);
    res.status(500).json({ error: 'Error fetching driver' });
  }
};

export const verifyDriver = async (driverId) => {
  try {
    console.log(driverId)
    // Fetch the driver from the delivery service
    const driver = await Driver.findOne({userId: driverId});

    if (!driver) {
      return 'Driver not found' ;
    }

    // Fetch the user details from the auth-service using the userId
    const userId = driver.userId;
    let userName = 'Name not available';

    try {
      // Send request to the auth-service to get user details by userId
      const userResponse = await axios.get(`http://localhost:5000/api/auth/users/${userId}`);
      userName = userResponse.data.name;
    } catch (err) {
      console.error('Error fetching user data from auth service', err.message);
    }

    // Send back driver details including the user's name
    return {
      ...driver.toObject(),
      driverName: userName,
    };

  } catch (error) {
    console.error('Error in getDriverById:', error);
    return 'Error fetching driver' ;
  }
};