import { MenuItem, Restaurant } from '../models/Restaurant.js';
import Order from '../models/Order.js';

// Add Menu Item
export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const menuItem = new MenuItem({
      restaurantId: req.user.restaurantId,
      name,
      description,
      price,
      category
    });
    const saved = await menuItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Menu Item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: req.user.restaurantId },
      { ...req.body, lastUpdated: Date.now() },
      { new: true }
    );
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });
    res.json(menuItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Menu Item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findOneAndDelete({
      _id: id,
      restaurantId: req.user.restaurantId
    });
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Menu Items
export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.user.restaurantId });
    res.json(menuItems);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Restaurant Availability
export const updateRestaurantAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const restaurant = await Restaurant.findOneAndUpdate(
      { restaurantId: req.user.restaurantId },
      { isAvailable, lastUpdated: Date.now() },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Incoming Orders
export const getIncomingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurantId: req.user.restaurantId,
      status: { $in: ['pending', 'accepted', 'preparing'] }
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId: req.user.restaurantId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
