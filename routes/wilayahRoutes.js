const express = require('express');
const router = express.Router();
const wilayahController = require('../controllers/wilayahController');

router.get("/provinsi", wilayahController.provinsi);
router.get("/kabupaten", wilayahController.kabupaten);
router.get("/kecamatan", wilayahController.kecamatan);
router.get("/kelurahan", wilayahController.kelurahan);
router.get('/kelurahan/search', wilayahController.searchKelurahan);

module.exports = router;