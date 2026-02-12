const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.post('/clean-orphan', maintenanceController.cleanOrphanFiles);

module.exports = router;