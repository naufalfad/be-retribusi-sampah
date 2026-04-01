const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register-staff', auth, authController.registerStaff);
router.post('/register-PetugasLapangan', auth, authController.registerPetugasLapangan);
router.post('/login-staff', authController.loginStaff);
router.get('/list-staff', authController.getAllStaff);
router.get('/list-PetugasLapangan', authController.getAllPetugasLapangan);
router.put('/reset-password-staff/:id_staff', auth, authController.resetStaffPassword);
router.put('/reset-password-PetugasLapangan/:id_petugas', auth, authController.resetPetugasLapanganPassword);
router.delete('/delete-staff/:id_staff', auth, authController.deleteStaff);
router.delete('/delete-PetugasLapangan/:id_petugas', auth, authController.deletePetugasLapangan);
router.post('/login-petugas-lapangan', authController.loginPetugasLapangan);

module.exports = router;