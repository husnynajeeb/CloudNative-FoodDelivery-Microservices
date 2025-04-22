import express from 'express';
import { registerCustomer, registerRestaurant, registerAdmin, login } from '../controllers/authController.js';

const router = express.Router();

// routes/authRoutes.js
router.post('/register/customer', registerCustomer);
router.post('/register/restaurant', registerRestaurant);
router.post('/register/admin', registerAdmin);
router.post('/login', login);

export default router;
