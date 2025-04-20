import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  updateLocation,
  getDriverLocation,
  updateDriverStatus,
  assignDriverToOrder,
  getAssignedOrder,
  createDriver,
  getDriverById,
} from '../controllers/deliveryController.js';

const router = express.Router();


router.patch('/:id/location',protect, updateLocation);
router.get('/:id/location', protect, getDriverLocation);
router.patch('/:id/status', protect, updateDriverStatus);
router.post('/assign', protect, assignDriverToOrder); // POST body: { orderId, deliveryCoordinates }
router.get('/assigned', protect, getAssignedOrder); // NEW ROUTE
router.post('/driver', createDriver);
router.get('/:id', protect, getDriverById); 


export default router;
