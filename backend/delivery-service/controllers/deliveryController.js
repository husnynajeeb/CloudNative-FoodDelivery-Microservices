// backend/delivery-service/controllers/deliveryController.js
import DeliveryProfile from '../models/DeliveryProfile.js';
import axios from 'axios';


export const createDriver = async (req, res) => {
  const { authDriverId, location } = req.body; // ⬅️ include location here!

  try {
    // Ensure the location is a GeoJSON Point
    const driverLocation = {
      type: 'Point',
      coordinates: location?.coordinates || [0, 0] // Use safe optional chaining
    };

    const deliveryProfile = new DeliveryProfile({
      authDriverId,
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

// Update driver's location not tested
export const updateLocation = async (req, res) => {
  const { coordinates } = req.body;
  const driverId = req.params.id;

  try {
    const driver = await DeliveryProfile.findByIdAndUpdate(
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
      const userResponse = await axios.get(`http://localhost:5000/api/auth/drivers/${userId}`);
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
      const userResponse = await axios.get(`http://localhost:5000/api/auth/drivers/${userId}`);
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
      `http://localhost:5001/api/orders/${orderId}/assign-driver`,
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
      `http://localhost:5001/api/orders/add`,
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