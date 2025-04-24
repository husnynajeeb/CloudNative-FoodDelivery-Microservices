import express from 'express';
import { initiatePayment, handleWebhook,confirmPayment,getPaymentStatus } from '../Controller/paymentController.js';
import bodyParser from 'body-parser';

const router = express.Router();

// Route to initiate payment
router.post('/initiate', initiatePayment);
router.post('/confirm', confirmPayment);
router.get('/status/:paymentIntentId', getPaymentStatus);

// Route to handle Stripe webhook (make sure to use raw body parser for Stripe)
// Special handling for webhook - must use raw body parser
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default router;

