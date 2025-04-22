import axios from 'axios';

export const getPendingOrders = async (req, res) => {
  const restaurantId = req.user.id; // From token

  try {
    const response = await axios.get(`http://order-service:5001/api/orders/restaurant/${restaurantId}`);
    res.json(response.data);
} catch (err) {
    console.error('🔴 Failed to fetch orders for restaurant:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url,
    });
    res.status(500).json({ message: 'Failed to fetch orders for restaurant' });
  }
};