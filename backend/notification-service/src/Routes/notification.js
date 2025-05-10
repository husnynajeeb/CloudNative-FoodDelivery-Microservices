// routes/twilioRoutes.js
const express = require('express');
const router = express.Router();
const twilioController = require('../Controller/notification');

router.post('/send-sms', twilioController.sendSms);

module.exports = router;
