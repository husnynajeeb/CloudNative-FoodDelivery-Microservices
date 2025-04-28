import express from 'express';
import { initiatePayment, handleWebhook,getPaymentStatus } from '../Controller/paymentController.js';


const router = express.Router();

// Route to initiate payment
router.post('/initiate', initiatePayment);

router.get('/status/:paymentIntentId', getPaymentStatus);

// Route to handle Stripe webhook (make sure to use raw body parser for Stripe)
// Special handling for webhook - must use raw body parser
// Stripe webhook (MUST be placed after `express.raw()` is set in server.js)
router.post('/webhook', handleWebhook);

export default router;

