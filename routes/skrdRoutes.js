const express = require('express');
const router = express.Router();
const skrdController = require('../controllers/skrdController');

router.post('/penetapan-skrd', skrdController.penetapanSkrd);
router.get('/list-skrd', skrdController.getListSkrd);
// router.get('/get-skrdByObjek/:id_objek', skrdController.getSkrdByObjek);
router.get('/pdf/:id_skrd', skrdController.cetakSkrdPdf);
router.get('/preview-skrd/:id_skrd', skrdController.previewSkrdHtml);
router.get('/list-unpaid-skrd', skrdController.unpaidSkrdList);

module.exports = router;