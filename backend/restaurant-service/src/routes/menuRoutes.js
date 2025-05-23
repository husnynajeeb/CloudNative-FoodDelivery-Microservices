import express from 'express';
import {
  createMenuItem,
  getMyMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getMenuByRestaurantId,
  getMenuItem
} from '../controllers/menuController.js';
import { getPendingOrders , updateOrderStatus } from '../controllers/orderController.js';
import { verifyRestaurant } from '../middleware/auth.js';


const router = express.Router();

// 🔐 Private Routes – require restaurant login
router.post('/', verifyRestaurant, createMenuItem);
router.get('/me', verifyRestaurant, getMyMenuItems);
router.patch('/:id', verifyRestaurant, updateMenuItem);
router.delete('/:id', verifyRestaurant, deleteMenuItem);

// 🌐 Public Route – for customers
router.get('/restaurant/:restaurantId', getMenuByRestaurantId);
router.get('/orders', verifyRestaurant, getPendingOrders);
router.patch('/orders/:id/status', verifyRestaurant, updateOrderStatus);

router.get('/:id', verifyRestaurant, getMenuItem);

export default router;
