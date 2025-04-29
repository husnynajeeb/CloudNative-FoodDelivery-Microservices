import express from 'express';
import {
  placeOrder,
  updateOrderStatus,
  getPendingOrders,
  getCompletedOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  getRestaurantsWithMenus,
  assignDriver,
  getRestaurantOrderById,
  updateOrderStatusTemp,
  getOrderTracking,
  getActiveOrderForCustomer,
  getCompletedOrdersForCustomer
} from '../controllers/orderController.js';
import { verifyCustomer } from '../middleware/auth.js';

const router = express.Router();

router.get('/restaurants-with-menus', getRestaurantsWithMenus);


router.post('/', verifyCustomer, placeOrder);
router.patch('/:id/states', updateOrderStatus);
router.get('/restaurant/:restaurantId/pending', getPendingOrders);
router.get('/restaurant/:restaurantId/completed', getCompletedOrders);
router.get('/:id', getOrderById); // get single order by ID
router.delete('/:id/cancel', cancelOrder); // cancel order by ID
router.patch('/:id/status', updateOrderStatusTemp );

router.get('/restaurants-with-menus', getRestaurantsWithMenus);

router.get('/restaurant/:restaurantId', getRestaurantOrders); // get all orders for a restaurant
router.put('/:orderId/assign-driver', assignDriver);
router.post('/add', getRestaurantOrderById);

router.get('/:orderId/tracking', getOrderTracking);
router.get('/customer/:customerId/active', getActiveOrderForCustomer);
router.get('/customer/:customerId/completed', getCompletedOrdersForCustomer);



export default router;
