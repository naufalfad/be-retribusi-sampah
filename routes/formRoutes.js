const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const formController = require('../controllers/formController');

router.post('/input-template', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'ttd_pejabat', maxCount: 1 }
]),
    formController.inputTemplate
);
router.put('/update-template/:id_template', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'ttd_pejabat', maxCount: 1 }
]),
    formController.updateTemplate
);

router.get('/get-template', formController.getForm);

module.exports = router;