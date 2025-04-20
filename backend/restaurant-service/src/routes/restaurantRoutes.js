import express from 'express';
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateRestaurantAvailability,
  getIncomingOrders,
  updateOrderStatus
} from '../controllers/restaurantController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Menu Item Routes
router.post('/menu', authenticateToken, addMenuItem);
router.put('/menu/:id', authenticateToken, updateMenuItem);
router.delete('/menu/:id', authenticateToken, deleteMenuItem);
router.get('/menu', authenticateToken, getMenuItems);

// Restaurant Availability Route
router.patch('/availability', authenticateToken, updateRestaurantAvailability);

// Order Management Routes
router.get('/orders', authenticateToken, getIncomingOrders);
router.patch('/orders/:orderId/status', authenticateToken, updateOrderStatus);

export default router;
