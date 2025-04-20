import express from 'express';
import {
  placeOrder,
  getCustomerOrders,
  updateOrderStatus,
  getPendingOrders,
  assignDriver,
  getOrderById
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', placeOrder);
router.get('/customer/:customerId', getCustomerOrders);
router.patch('/:id/status', updateOrderStatus);
router.get('/restaurant/:restaurantId/pending', getPendingOrders);
router.put('/:orderId/assign-driver', assignDriver);
router.post('/add', getOrderById);


export default router;
