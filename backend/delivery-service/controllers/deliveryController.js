// backend/delivery-service/controllers/deliveryController.js
import DeliveryProfile from '../models/DeliveryProfile.js';
import axios from 'axios';
import mongoose from "mongoose";

export const createDriver = async (req, res) => {
  const { authDriverId, location , phone} = req.body; // ⬅️ include location here!

  try {
    // Ensure the location is a GeoJSON Point
    const driverLocation = {
      type: 'Point',
      coordinates: location?.coordinates || [0, 0] // Use safe optional chaining
    };

    const deliveryProfile = new DeliveryProfile({
      authDriverId,
      phone:phone,
      status: "available",
      location: driverLocation,
      rating: 5.0,
      deliveriesCompleted: 0,
    });

    await deliveryProfile.save();

    res.status(201).json({ message: "Delivery profile created", deliveryProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const { ObjectId } = mongoose.Types;

export const updateLocation = async (req, res) => {
  const { coordinates } = req.body;
  const driverId = req.params.id;

  console.log('updateLocation hit');
  console.log('Body:', req.body);
  console.log('Params:', req.params);

  try {
    const driver = await DeliveryProfile.findOneAndUpdate(
      { authDriverId: new ObjectId(driverId) }, // cast string to ObjectId
      {
        currentLocation: {
          type: 'Point',
          coordinates,
        },
      },
      { new: true }
    );

    if (!driver) {
      console.log('Driver not found for authDriverId:', driverId);
      return res.status(404).json({ error: 'Driver not found' });
    }

    req.io.emit('driverLocationUpdated', {
      driverId,
      coordinates,
    });

    res.json(driver);
  } catch (err) {
    console.error('Error updating driver location:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get current location of a driver not tested
export const getDriverLocation = async (req, res) => {
  try {
    const driver = await DeliveryProfile.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver.location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Change driver status not tested
export const updateDriverStatus = async (req, res) => {
  try {
    const driver = await DeliveryProfile.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateStatusByAuthDriverId = async (req, res) => {
  try {
    const { authDriverId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['available', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find by authDriverId and update
    const updatedProfile = await DeliveryProfile.findOneAndUpdate(
      { authDriverId },
      { status },
      { new: true } // return updated doc
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Delivery profile not found' });
    }

    res.json(updatedProfile);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getDriverById = async (req, res) => {
  try {
    const driverId = req.params.id;

    // Fetch the driver from the delivery service
    const driver = await DeliveryProfile.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Fetch the user details from the auth-service using the userId
    const userId = driver.authDriverId;
    let userName = 'Name not available';

    try {
      // Send request to the auth-service to get user details by userId
      const userResponse = await axios.get(`http://auth-service:5000/api/auth/drivers/${userId}`);
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
    const driver = await DeliveryProfile.findOne({authDriverId: driverId});

    if (!driver) {
      return 'Driver not found' ;
    }

    // Fetch the user details from the auth-service using the userId
    const userId = driver.authDriverId;
    let userName = 'Name not available';

    try {
      // Send request to the auth-service to get user details by userId
      const userResponse = await axios.get(`http://auth-service:5000/api/auth/drivers/${userId}`);
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



export const assignDriverToOrder = async (req, res) => {
  const { orderId, deliveryCoordinates } = req.body;

  if (
    !orderId ||
    !deliveryCoordinates ||
    !Array.isArray(deliveryCoordinates) ||
    deliveryCoordinates.length !== 2
  ) {
    return res.status(400).json({ error: 'Invalid orderId or delivery coordinates' });
  }

  try {
    // Find nearest available driver
    const driver = await DeliveryProfile.findOne({
      status: 'available',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: deliveryCoordinates,
          },
          $maxDistance: 50000, // 50km
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: 'No drivers available near location' });
    }

    const driverId = driver.authDriverId;

    // Assign driver to order
    const orderUpdateResponse = await axios.put(
      `http://order-service:5001/api/orders/${orderId}/assign-driver`,
      { driverId }
    );

    const updatedOrder = orderUpdateResponse.data?.order;

    if (!updatedOrder) {
      return res.status(500).json({ error: 'Failed to update order with driver' });
    }

    // Mark driver as busy
    driver.status = 'busy';
    await driver.save();

    res.status(200).json({
      message: 'Driver assigned successfully',
      driver: {
        id: driver._id,
        phone: driver.phone,
        authDriverId: driver.authDriverId,
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
      `http://order-service:5001/api/orders/add`,
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


export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await DeliveryProfile.find();
    res.status(200).json(drivers);
  } catch (err) {
    console.error('Error fetching drivers:', err.message);
    res.status(500).json({ error: 'Failed to retrieve drivers' });
  }
};


// In your delivery service controller, e.g. getDriverById:

// Example Mongoose controller for delivery service
export const getDriverByAuthId = async (req, res) => {
  try {
    const authDriverId = req.params.id;
    console.log('Received authDriverId:', authDriverId);

    const driver = await DeliveryProfile.findOne({ authDriverId });

    if (!driver) {
      console.log('Driver not found for authDriverId:', authDriverId);
      return res.status(404).json({ error: 'Driver not found' });
    }

    console.log('Driver found:', driver);
    res.status(200).json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




