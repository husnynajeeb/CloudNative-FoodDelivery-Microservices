import Order from '../models/Order.js';
import axios from 'axios';

// ✅ Place new order
export const placeOrder = async (req, res) => {
  try {
    const { customerId, restaurantId, items, totalAmount, deliveryAddress , location } = req.body;

    const order = new Order({
      customerId,
      restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      location
       
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update status (by restaurant)
export const updatesOrderStatus = async (req, res) => {
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


export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, restaurantId } = req.body;

  const allowed = ['pending', 'accepted', 'preparing', 'dispatched', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // 🟢 Update order status
    const order = await Order.findOneAndUpdate(
      { _id: id, restaurantId },
      { status },
      { new: true }
    );

    if (!order) {
      console.warn('⚠️ Order not found or not authorized');
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    console.log('✅ Order status updated:', order.status);

    // 🟢 If dispatched, assign driver
    if (status === 'dispatched') {
      try {
        console.log('🚚 Dispatching... Assigning driver for order:', order._id);
        console.log('📍 Delivery Coordinates:', order.location.coordinates);

        const deliveryResponse = await axios.post(
          'http://localhost:5003/api/delivery/assign',
          {
            orderId: order._id,
            deliveryCoordinates: order.location.coordinates,
          },
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDM4NDhhMmY4ZDc5NWYyNTdlOWIyMiIsInJvbGUiOiJkZWxpdmVyeSIsImlhdCI6MTc0NTE2Nzg4NiwiZXhwIjoxNzQ1NzcyNjg2fQ.N4t4zT5zwbZz0PDGSL-n0tZVHa7y9tE_qG2VlSOgg0o`
            }
          }
        );

        console.log('📦 Delivery Service Response:', deliveryResponse.data);

        // ✅ Assign driver to order if found
        if (deliveryResponse.data.driver?.authDriverId) {
          order.driverId = deliveryResponse.data.driver.authDriverId;
          await order.save();
          console.log('✅ Driver assigned:', order.driverId);
        } else {
          console.warn('⚠️ No driver assigned in response');
        }

      } catch (deliveryErr) {
        console.error('❌ Failed to assign driver:', deliveryErr.message);
      }
    }

    res.json({ message: 'Order status updated', data: order });

  } catch (err) {
    console.error('❌ Error updating order status:', err.message);
    res.status(500).json({ error: err.message });
  }
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


export const getCustomerOrders = async (req, res) => {
  const { customerId } = req.params;
  const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
  res.json(orders);
};


export const getRestaurantOrderById = async (req, res) => {
  try {
    const { driverId  } = req.body;
    console.log(driverId)

    const order = await Order.findOne({ driverId , status:'dispatched' });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const RestaurantInfo = await axios.get(`http://192.168.1.3:5000/api/auth/Restaurants/${order.restaurantId}`)

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


export const updateOrderStatusTemp = async (req, res) => {
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(updated);
};