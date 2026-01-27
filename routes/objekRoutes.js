const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const objekController = require('../controllers/objekController');

router.post('/tambah-objek/:id_subjek', upload.array('dokumen_objek', 10), objekController.createObjek);
router.get('/all-objek', objekController.getAllObjek);

module.exports = router;
