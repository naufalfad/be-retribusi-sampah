const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/summary-report', reportController.getSummaryReport);
router.get('/regiobal-report', reportController.getRegionalReport);
router.get('/detail-report', reportController.getDetailedReport);
router.get('/cetak-report', reportController.exportReportPdf);

module.exports = router