import Order from '../models/Order.js';
import axios from 'axios';
import mongoose from 'mongoose';

export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, restaurantId, customerId, deliveryAddress } = req.body;

    // Validate required fields
    if (!items || !totalAmount || !restaurantId || !customerId || !deliveryAddress?.coordinates) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    // Create and save the order
    const newOrder = new Order({
      customerId,
      restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      status: 'pending',
    });

    const savedOrder = await newOrder.save();
    console.log('✅ Order placed:', savedOrder._id);

    // Extract delivery coordinates
    const coordinates = deliveryAddress.coordinates;
    console.log('📍 Delivery coordinates:', coordinates);

    // Request driver assignment from delivery service
    const assignDriverResponse = await axios.post('http://localhost:5003/api/delivery/assign', {
      orderId: savedOrder._id,
      deliveryCoordinates: coordinates,
    },{
      headers:{
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDM4NDhhMmY4ZDc5NWYyNTdlOWIyMiIsInJvbGUiOiJkZWxpdmVyeSIsImlhdCI6MTc0NTE2Nzg4NiwiZXhwIjoxNzQ1NzcyNjg2fQ.N4t4zT5zwbZz0PDGSL-n0tZVHa7y9tE_qG2VlSOgg0o`
      }
    });

    console.log('🚗 Assign driver response:', assignDriverResponse.data);

    const assignedDriver = assignDriverResponse.data?.driver;

    if (!assignedDriver || !assignedDriver.id) {
      console.error('❌ No driver returned from delivery service');
      return res.status(500).json({ error: 'Driver could not be assigned' });
    }

    console.log('✅ Driver assigned:', assignedDriver.id);

    // Optionally fetch full driver details
    const driverInfoResponse = await axios.get(`http://localhost:5003/api/delivery/${assignedDriver.id}`,{
      headers:{
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDM4NDhhMmY4ZDc5NWYyNTdlOWIyMiIsInJvbGUiOiJkZWxpdmVyeSIsImlhdCI6MTc0NTE2Nzg4NiwiZXhwIjoxNzQ1NzcyNjg2fQ.N4t4zT5zwbZz0PDGSL-n0tZVHa7y9tE_qG2VlSOgg0o`
      }
    });
    const fullDriverInfo = driverInfoResponse.data;

    console.log('ℹ️ Full driver info:', fullDriverInfo);

    // Optionally update the order with the assigned driver
    const updatedOrder = await Order.findByIdAndUpdate(savedOrder._id, { driverId: assignedDriver.userId }, { new: true });

    // Return success response
    res.status(201).json({
      message: 'Order placed and driver assigned',
      order: updatedOrder,  // return updated order with assigned driver
      driver: fullDriverInfo,
    });

  } catch (error) {
    console.error('❌ Delivery service error:', error.message, error.response?.data || '');
    res.status(500).json({ error: 'Failed to place order and assign driver' });
  }
}


export const getCustomerOrders = async (req, res) => {
  const { customerId } = req.params;
  const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
  res.json(orders);
};


export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(updated);
};

export const getPendingOrders = async (req, res) => {
  const { restaurantId } = req.params;
  const pending = await Order.find({ restaurantId, status: 'pending' });
  res.json(pending);
};


// Assign driver to order
export const assignDriver = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { driverId, status: 'dispatched' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Driver assigned', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const { driverId  } = req.body;
    console.log(driverId)

    const order = await Order.findOne({ driverId , status:'dispatched' });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const RestaurantInfo = await axios.get(`http://192.168.1.3:5002/api/restaurant/${order.restaurantId}`)

    res.status(200).json({
      status: 200,
      order: order,
      restaurant: RestaurantInfo.data,
    });
  } catch (error) {
    console.error('❌ Error fetching order by ID:', error.message);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
};
