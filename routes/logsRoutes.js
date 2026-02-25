const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

router.get('/list', logsController.getAuditLogs);
router.get('/modules', logsController.getAuditModules);

module.exports = router;