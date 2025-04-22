import express from 'express';
import { initiatePayment, handleWebhook } from '../Controller/paymentController.js';

const router = express.Router();

router.post('/pay', handleWebhook); // assuming `processPayment` was a typo
router.post('/initiate', initiatePayment);

export default router;
