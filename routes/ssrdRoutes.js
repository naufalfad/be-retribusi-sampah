const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ssrdController = require('../controllers/ssrdController');

router.post('/penetapan-ssrd', auth, ssrdController.buatSsrd);
router.get('/list-ssrd', ssrdController.getListSsrd);
router.get('/preview-ssrd/:id_ssrd', ssrdController.previewSsrdHtml);
router.get('/pdf/:id_ssrd', ssrdController.cetakSsrdPdf);
router.post('/pembayaran-penagih', auth, ssrdController.paymentPenagih);
router.post('/verifikasi-rekon', ssrdController.verifikasiPembayaran);
router.get('/list-pending', ssrdController.getListPending);
router.get('/paid-list', ssrdController.getListSsrdPaid);
router.post('/pembayaran-user', auth, ssrdController.initiateMidtransPayment);
router.post('/notification', ssrdController.handleMidtransNotification);

module.exports = router;