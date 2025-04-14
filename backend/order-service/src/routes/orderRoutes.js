import express from 'express';
import {
  placeOrder,
  getCustomerOrders,
  updateOrderStatus,
  getPendingOrders
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', placeOrder);
router.get('/customer/:customerId', getCustomerOrders);
router.patch('/:id/status', updateOrderStatus);
router.get('/restaurant/:restaurantId/pending', getPendingOrders);

export default router;
