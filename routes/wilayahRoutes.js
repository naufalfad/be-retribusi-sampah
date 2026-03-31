const express = require('express');
const router = express.Router();
const wilayahController = require('../controllers/wilayahController');
const auth = require('../middleware/authMiddleware');

router.get('/penagih-wilayah', auth, wilayahController.getWilayahKerjaDetail);
router.get("/provinsi", wilayahController.getProvinsi);
router.get("/kabupaten/:id_provinsi", wilayahController.getKabupaten);
router.get("/kecamatan/:id_kabupaten", wilayahController.getKecamatan);
router.get("/kelurahan/:id_kecamatan", wilayahController.getKelurahan);
router.get("/search-kelurahan", wilayahController.searchKelurahan);

module.exports = router;