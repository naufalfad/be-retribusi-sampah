const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');
const skrdController = require('../controllers/skrdController');

// Endpoint Publik: Pengecekan Cepat Tagihan SKRD untuk Landing Page (Dilindungi Rate Limiter & Masking Data)
router.get('/public-check', rateLimiter({ windowMs: 60 * 1000, max: 20 }), skrdController.publicCheckSkrd);

router.post('/penetapan-skrd', auth, skrdController.penetapanSkrd);
router.get('/list-skrd', skrdController.getListSkrd);
// router.get('/get-skrdByObjek/:id_objek', skrdController.getSkrdByObjek);
router.get('/pdf/:id_skrd', skrdController.cetakSkrdPdf);
router.get('/preview-skrd/:id_skrd', skrdController.previewSkrdHtml);
router.get('/list-unpaid-skrd', skrdController.unpaidSkrdList);
router.get('/list-unpaid-saya', auth, skrdController.getMyUnpaidSkrd);
router.get('/detail/:id_skrd', skrdController.getSkrdDetail);

module.exports = router;