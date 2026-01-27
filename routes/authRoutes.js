const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-staff', authController.registerStaff);
router.post('/login-staff', authController.loginStaff);

module.exports = router;