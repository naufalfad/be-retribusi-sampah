const express = require('express');
const router = express.Router();
const skrdController = require('../controllers/skrdController');

router.post('/penetapan/:id_objek', skrdController.penetapanSkrd);

module.exports = router;