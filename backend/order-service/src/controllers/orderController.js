import Order from '../models/Order.js';
import axios from 'axios';

// ✅ Place new order
export const placeOrder = async (req, res) => {
  try {
    const { customerId, restaurantId, items, totalAmount, deliveryAddress } = req.body;

    const order = new Order({
      customerId,
      restaurantId,
      items,
      totalAmount,
      deliveryAddress
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update status (by restaurant)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Cancel order (by customer)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be canceled' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get completed orders (by restaurantId)
export const getCompletedOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId, status: 'delivered' }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get pending orders (by restaurantId)
export const getPendingOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId, status: 'pending' }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all orders for a restaurant (by restaurantId)
export const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRestaurantsWithMenus = async (req, res) => {
  try {
    // Fetch all restaurants from auth-service
    const authResponse = await axios.get('http://auth-service:5000/api/auth/restaurants');
    const restaurants = authResponse.data;

    // For each restaurant, fetch its menu from restaurant-service
    const enrichedRestaurants = await Promise.all(
      restaurants.map(async (restaurant) => {
        const menuRes = await axios.get(`http://restaurant-service:5002/api/restaurant-menu/restaurant/${restaurant._id}`);
        return {
          ...restaurant,
          menu: menuRes.data
        };
      })
    );

    res.json(enrichedRestaurants);
  } catch (err) {
    console.error('Error fetching restaurant menus:', err.message);
    res.status(500).json({ message: 'Failed to fetch restaurants with menus' });
  }
};