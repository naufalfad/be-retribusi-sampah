const express = require('express');
const router = express.Router();
const ssrdController = require('../controllers/ssrdController');

router.post('/penetapan-ssrd', ssrdController.buatSsrd);
router.get('/list-ssrd', ssrdController.getListSsrd);
router.get('/preview-ssrd/:id_ssrd', ssrdController.previewSsrdHtml);
router.get('/pdf/:id_ssrd', ssrdController.cetakSsrdPdf);
router.post('/pembayaran-penagih', ssrdController.paymentPenagih);
router.post('/verifikasi-rekon', ssrdController.verifikasiPembayaran);
router.get('/list-pending', ssrdController.getListPending);

module.exports = router;