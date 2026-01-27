const express = require('express');
const router = express.Router();
const subjekController = require('../controllers/subjekController');
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware')

router.get('/list', subjekController.getListSubjek);
router.post('/tambah-subjek', auth, upload.single('dokumen_subjek'), subjekController.createSubjek);
router.get('/dokumen/:id_subjek', subjekController.getDokumenSubjek);

module.exports = router;