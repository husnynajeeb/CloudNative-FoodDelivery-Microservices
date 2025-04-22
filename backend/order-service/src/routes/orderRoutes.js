import express from 'express';
import {
  placeOrder,
  updateOrderStatus,
  getPendingOrders,
  getCompletedOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  getRestaurantsWithMenus
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', placeOrder);
router.patch('/:id/status', updateOrderStatus);
router.get('/restaurant/:restaurantId/pending', getPendingOrders);
router.get('/restaurant/:restaurantId/completed', getCompletedOrders);
router.get('/:id', getOrderById); // get single order by ID
router.delete('/:id/cancel', cancelOrder); // cancel order by ID

router.get('/restaurants-with-menus', getRestaurantsWithMenus);

router.get('/restaurant/:restaurantId', getRestaurantOrders); // get all orders for a restaurant

export default router;
