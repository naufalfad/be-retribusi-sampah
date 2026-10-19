const express = require('express');
const router = express.Router();
const tempatSampahController = require('../controllers/tempatSampahController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint Publik / GIS Monitoring
router.get('/', tempatSampahController.getAllTempatSampah);
router.get('/stats', tempatSampahController.getTempatSampahStats);
router.get('/:id', tempatSampahController.getTempatSampahById);

// Endpoint Manajemen (Memerlukan Autentikasi DLH/Admin)
router.post('/', authMiddleware, tempatSampahController.createTempatSampah);
router.put('/:id', authMiddleware, tempatSampahController.updateTempatSampah);
router.delete('/:id', authMiddleware, tempatSampahController.deleteTempatSampah);

module.exports = router;
