const express = require('express');
const router = express.Router();
const poinController = require('../controllers/poinController');
const auth = require('../middleware/authMiddleware');

// Grouping rute poin (Hanya Admin yang boleh mengelola)
router.get('/categories', auth, poinController.getAllCategories);
router.post('/categories', auth, poinController.createCategory);
router.put('/categories/:id', auth, poinController.updateCategory);
router.delete('/categories/:id', auth, poinController.deleteCategory);
router.post('/pengangkutan', auth, poinController.createPengangkutan);
router.get('/pengangkutan/monitoring', auth, poinController.monitoringPengangkutan);

module.exports = router;