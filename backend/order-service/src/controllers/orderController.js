import Order from '../models/Order.js';

export const placeOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

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
