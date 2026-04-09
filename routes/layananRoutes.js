const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const layananController = require('../controllers/layananController');

router.post('/pengajuan', auth, upload.single('file_pendukung'),
    layananController.createPengajuan
);

router.get('/list-all', auth, layananController.getListPengajuan);

router.put('/proses/:id_pengajuan', auth, layananController.verifikasiLayanan);

module.exports = router;