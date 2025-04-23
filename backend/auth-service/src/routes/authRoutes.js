import express from 'express';
import { registerCustomer, registerRestaurant, registerAdmin, getAllRestaurants, login , registerDriver, getDriverById ,  AllRestaurants  , getRestaurantById } from '../controllers/authController.js';

const router = express.Router();

// routes/authRoutes.js
router.post('/register/customer', registerCustomer);
router.post('/register/restaurant', registerRestaurant);
router.post('/register/admin', registerAdmin);
router.post('/login', login);
router.post('/register/driver', registerDriver);
router.get('/restaurants', getAllRestaurants);
router.get('/drivers/:id', getDriverById);
router.get('/Restaurants', AllRestaurants);
router.get('/Restaurants/:id', getRestaurantById);

export default router;
