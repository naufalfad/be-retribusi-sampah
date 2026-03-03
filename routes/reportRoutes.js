const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

router.get('/summary-report', reportController.getSummaryReport);
router.get('/regiobal-report', reportController.getRegionalReport);
router.get('/detail-report', reportController.getDetailedReport);
router.get('/cetak-report', reportController.exportReportPdf);
router.get('/admin-stats', reportController.getAdminStats);
router.get('/upt-stats', auth, reportController.getUptStats);
router.get('/bendahara-stats', auth, reportController.getBendaharaStats);
router.get('/penagih-stats', auth, reportController.getPenagihStats);

module.exports = router