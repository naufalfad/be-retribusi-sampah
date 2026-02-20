const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

router.get('/list', logsController.getAuditLogs);

module.exports = router;