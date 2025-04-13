const express = require('express');
const router = express.Router();
const controller = require('../controllers/deliveryController');

router.get('/drivers', controller.getDrivers);
router.get('/orders', controller.getOrders);
router.get('/track/:id', controller.trackOrder);
router.post('/assign-driver', controller.assignDriver);
router.post('/drivers', controller.createDriver);

module.exports = router;
