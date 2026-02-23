const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register-staff', auth, authController.registerStaff);
router.post('/login-staff', authController.loginStaff);
router.get('/list-staff', authController.getAllStaff);
router.put('/reset-password/:id_staff', auth, authController.resetStaffPassword);
router.delete('/delete-staff/:id_staff', auth, authController.deleteStaff);

module.exports = router;