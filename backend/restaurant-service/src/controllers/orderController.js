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


export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;          // order id
  const { status } = req.body;        // new status
  const restaurantId = req.user.id;   // from JWT token middleware

  try {
    const orderServiceURL = `http://localhost:5001/api/orders/${id}/states`;
    const response = await axios.patch(orderServiceURL, {
      status,
      restaurantId  // pass the server-trusted restaurantId to order service
    });

    res.json({ message: 'Order status updated via Order Service', data: response.data });
  } catch (err) {
    console.error('🔴 Failed to update order status:', err.message);
    res.status(500).json({ message: 'Could not update order status' });
  }
};

