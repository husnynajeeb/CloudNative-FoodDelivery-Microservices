import express from "express";
import { protect } from '../middleware/auth.js';
import {createDriver , updateStatusByAuthDriverId ,  getDriverById , assignDriverToOrder , updateLocation , getDriverLocation , updateDriverStatus ,  getAssignedOrder , getAllDrivers , getDriverByAuthId} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/driver', createDriver);
router.get('/driver', getAllDrivers);
router.get('/:id', protect, getDriverById); 
router.post('/assign', protect, assignDriverToOrder);
router.get('/assigned', protect, getAssignedOrder); // NEW ROU
router.put('/:id/location',protect, updateLocation);
router.get('/:id/location', protect, getDriverLocation);
router.patch('/:id/status', protect, updateDriverStatus);
router.patch('/delivery/status/:authDriverId', updateStatusByAuthDriverId);



router.get('/authdriver/:id', getDriverByAuthId);  // <-- This route

export default router;
