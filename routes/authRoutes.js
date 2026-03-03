const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register-staff', auth, authController.registerStaff);
router.post('/register-penagih', auth, authController.registerPenagih);
router.post('/login-staff', authController.loginStaff);
router.get('/list-staff', authController.getAllStaff);
router.get('/list-penagih', authController.getAllPenagih);
router.put('/reset-password-staff/:id_staff', auth, authController.resetStaffPassword);
router.put('/reset-password-penagih/:id_penagih', auth, authController.resetPenagihPassword);
router.delete('/delete-staff/:id_staff', auth, authController.deleteStaff);
router.delete('/delete-penagih/:id_penagih', auth, authController.deletePenagih);
router.post('/login-penagih', authController.loginPenagih);

module.exports = router;