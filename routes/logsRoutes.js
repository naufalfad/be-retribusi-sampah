const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const logsController = require('../controllers/logsController');

router.get('/list', logsController.getAuditLogs);
router.get('/modules', logsController.getAuditModules);
router.get('/riwayat-penagih', auth, logsController.getRiwayatPenagih);

module.exports = router;