import express from 'express';
import {
  createMenuItem,
  getMyMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getMenuByRestaurantId
} from '../controllers/menuController.js';
import { verifyRestaurant } from '../middleware/auth.js';

const router = express.Router();

// 🔐 Private Routes – require restaurant login
router.post('/', verifyRestaurant, createMenuItem);
router.get('/me', verifyRestaurant, getMyMenuItems);
router.patch('/:id', verifyRestaurant, updateMenuItem);
router.delete('/:id', verifyRestaurant, deleteMenuItem);

// 🌐 Public Route – for customers
router.get('/restaurant/:restaurantId', getMenuByRestaurantId);

export default router;
