const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const skrdController = require('../controllers/skrdController');

router.post('/penetapan-skrd', auth, skrdController.penetapanSkrd);
router.get('/list-skrd', skrdController.getListSkrd);
// router.get('/get-skrdByObjek/:id_objek', skrdController.getSkrdByObjek);
router.get('/pdf/:id_skrd', skrdController.cetakSkrdPdf);
router.get('/preview-skrd/:id_skrd', skrdController.previewSkrdHtml);
router.get('/list-unpaid-skrd', skrdController.unpaidSkrdList);
router.get('/list-unpaid-saya', auth, skrdController.getMyUnpaidSkrd);
router.get('/detail/:id_skrd', skrdController.getSkrdDetail);

module.exports = router;