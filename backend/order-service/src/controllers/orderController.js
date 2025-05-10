import Order from '../models/Order.js';
import axios from 'axios';
import { geocodeAddress } from '../../geocode.js'; // Assume you put the above function here

export const placeOrder = async (req, res) => {
  try {
    console.log('📦 Incoming Payload:', req.body);

    const { restaurantId, items, totalAmount, deliveryAddress, customerId } = req.body;

    console.log('customerId:', customerId);
    console.log('restaurantId:', restaurantId);
    console.log('items:', items);
    console.log('totalAmount:', totalAmount);
    console.log('deliveryAddress:', deliveryAddress);

    // Construct full address string
    const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.country}`;
    console.log('Full address:', fullAddress);

    // Get coordinates from geocode function
    const coordinates = await geocodeAddress(fullAddress);
    console.log('Coordinates from geocode:', coordinates);

    // Validate coordinates array
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid coordinates received from geocode' });
    }

    // Create new order document
    const order = new Order({
      customerId,
      restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      location: {
        type: 'Point',
        coordinates, // [lng, lat]
      },
    });

    // Try saving order and catch validation errors
    try {
      await order.save();
      console.log('✅ Order saved successfully');
    } catch (saveErr) {
      console.error('❌ Validation error during order.save():', saveErr);
      return res.status(400).json({ message: saveErr.message });
    }

    // Respond with success
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('❌ Unexpected error inside placeOrder:', err);
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
    // 🟢 Update order status in DB
    const order = await Order.findOneAndUpdate(
      { _id: id, restaurantId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    console.log('✅ Order status updated:', order.status);

    // 🟢 If dispatched, assign driver
    if (status === 'dispatched') {
      try {
        console.log('🚚 Dispatching... Assigning driver for order:', order._id);
        console.log('📍 Delivery Coordinates:', order.location.coordinates);

        const deliveryResponse = await axios.post(
          'http://delivery-service:5004/api/delivery/assign',
          {
            orderId: order._id,
            deliveryCoordinates: order.location.coordinates,
          },
          {
            headers: {
              'internal-call': 'true',
            },
          }
        );

        console.log('📦 Delivery Service Response:', deliveryResponse.data);

        if (deliveryResponse.data.driver?.authDriverId) {
          order.driverId = deliveryResponse.data.driver.authDriverId;
          await order.save();
          console.log('✅ Driver assigned:', order.driverId);

          const driverPhone = deliveryResponse.data.driver.phone;
          if (driverPhone) {
            try {
              // 📲 Send SMS via notification service (which uses TextBee)
              await axios.post('http://notification-service:5005/notification/send-sms', {
                phoneNumber: driverPhone,
                message: `🚚 You have been assigned a new order (ID: ${order._id}). Please check your dashboard.`,
              });
              console.log('📩 SMS sent to driver via notification service:', driverPhone);
            } catch (smsErr) {
              console.error('❌ Failed to send SMS:', smsErr.message);
            }
          } else {
            console.warn('⚠️ No phone number provided for driver');
          }

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

    const RestaurantInfo = await axios.get(`http://auth-service:5000/api/auth/Restaurants/${order.restaurantId}`)

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


export const updateOrderStatusTemp = async (req, res) => {
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(updated);
};
;

export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Get the order without populate
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 2. Get restaurant location from restaurant microservice
    const restaurantRes = await axios.get(`http://auth-service:5000/api/auth/Restaurants/${order.restaurantId}`);
    const restaurant = restaurantRes.data;

    // 3. Get driver info from delivery microservice
    let driverLocation = null;
    if (order.driverId) {
      try {
        const driverRes = await axios.get(`http://delivery-service:5004/api/delivery/authdriver/${order.driverId}`);
        const driver = driverRes.data;
        if (driver.location && driver.location.coordinates) {
          driverLocation = {
            latitude: driver.location.coordinates[1],
            longitude: driver.location.coordinates[0],
          };
        }
      } catch (err) {
        console.warn('Warning: Could not fetch driver info from delivery service', err.message);
      }
    }

    // 4. Send back aggregated response
    res.json({
      customerLocation: {
        latitude: order.location.coordinates[1],
        longitude: order.location.coordinates[0],
      },
      restaurantLocation: {
        latitude: restaurant.location.coordinates[1],
        longitude: restaurant.location.coordinates[0],
      },
      driverLocation, // structured with lat, lng or null
      driverId: order.driverId,
      status: order.status,
      orderLocation: {
        latitude: order.location.coordinates[1],
        longitude: order.location.coordinates[0],
      }, // <-- 🔥 ADD THIS
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ✅ Get active order for a specific customer
export const getActiveOrderForCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const activeStatuses = ['pending', 'accepted', 'preparing', 'dispatched' , 'out_for_delivery'];

    const order = await Order.findOne({
      customerId,
      status: { $in: activeStatuses }
    }).sort({ createdAt: -1 }); // latest active order

    if (!order) {
      return res.status(404).json({ message: 'No active orders found for this customer' });
    }

    // 🔁 Fetch restaurant name
    let restaurantName = 'Unknown';
    try {
      const response = await axios.get(
        `http://auth-service:5000/api/auth/Restaurants/${order.restaurantId}`
      );
      restaurantName = response.data?.businessName || 'Unknown';
    } catch (err) {
      console.warn(`⚠️ Failed to fetch restaurant ${order.restaurantId}:`, err.message);
    }

    // 🔁 Fetch driver details (optional)
    let driverInfo = null;
    if (order.driverId) {
      try {
        const driverRes = await axios.get(`http://delivery-service:5004/api/delivery/authdriver/${order.driverId}`);
        driverInfo = driverRes.data;
      } catch (err) {
        console.warn('Driver info fetch failed:', err.message);
      }
    }

    res.status(200).json({
      message: 'Active order found',
      order: {
        ...order.toObject(),
        restaurantName,
      },
      driver: driverInfo,
    });
  } catch (err) {
    console.error('Error fetching active order:', err.message);
    res.status(500).json({ error: 'Server error while retrieving active order' });
  }
};

export const getCompletedOrdersForCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const completedOrders = await Order.find({
      customerId,
      status: 'delivered',
    }).sort({ createdAt: -1 });

    // 🔁 Fetch restaurant names for each order
    const enrichedOrders = await Promise.all(
      completedOrders.map(async (order) => {
        let restaurantName = 'Unknown';

        try {
          const response = await axios.get(
            `http://auth-service:5000/api/auth/Restaurants/${order.restaurantId}`
          );
          console.log('Restaurant response:', response.data);
          restaurantName = response.data?.businessName || 'Unknown';
        } catch (err) {
          console.warn(`⚠️ Failed to fetch restaurant ${order.restaurantId}:`, err.message);
        }

        return {
          ...order.toObject(),
          restaurantName,
        };
      })
    );

    res.json({ orders: enrichedOrders });
  } catch (err) {
    console.error('❌ Error fetching completed orders:', err.message);
    res.status(500).json({ error: 'Server error while retrieving completed orders' });
  }
};
