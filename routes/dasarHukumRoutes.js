const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const dasarHukumController = require('../controllers/dasarHukumController');

router.post('/tambah-peraturan', upload.single('dokumen_peraturan'), dasarHukumController.tambahPeraturan);
router.get('/list-peraturan', dasarHukumController.getPeraturan);
router.delete('/hapus-peraturan/:id', dasarHukumController.hapusPeraturan);

module.exports = router;