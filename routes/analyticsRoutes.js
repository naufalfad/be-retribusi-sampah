const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Route Publik / Protected untuk Monitoring Spasial GIS
router.get('/wildfires', analyticsController.getWildfires);
router.get('/batch-aqi', analyticsController.getBatchAqi);
router.get('/water-stations', analyticsController.getWaterStations);

module.exports = router;
