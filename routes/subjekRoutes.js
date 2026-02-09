const express = require('express');
const router = express.Router();
const subjekController = require('../controllers/subjekController');
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');

router.get('/list-subjek', subjekController.getListSubjek);
router.post('/tambah-subjek', auth, upload.array('dokumen_subjek'), subjekController.createSubjek);
router.get('/dokumen/:id_subjek', subjekController.getDokumenSubjek);
router.get('/pdf/:id_subjek', subjekController.cetakNpwrdPdf);
router.get('/preview-pdf/:id_subjek', subjekController.previewNpwrdHtml);

module.exports = router;