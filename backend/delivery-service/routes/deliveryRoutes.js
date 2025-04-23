import express from "express";
import { protect } from '../middleware/auth.js';
import {createDriver , getDriverById , assignDriverToOrder , updateLocation , getDriverLocation , updateDriverStatus ,  getAssignedOrder} from '../controllers/deliveryController.js';

const router = express.Router();

router.post("/driver", createDriver);
router.get('/:id', protect, getDriverById); 
router.post('/assign', protect, assignDriverToOrder);
router.get('/assigned', protect, getAssignedOrder); // NEW ROU
router.patch('/:id/location',protect, updateLocation);
router.get('/:id/location', protect, getDriverLocation);
router.patch('/:id/status', protect, updateDriverStatus);

export default router;
