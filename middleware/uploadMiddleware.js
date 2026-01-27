const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan untuk Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Filter jenis file yang diizinkan (opsional)
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/; // Sesuaikan jenis file yang diizinkan
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Tipe file tidak didukung! Hanya JPG, JPEG, PNG, PDF, DOC, DOCX yang diizinkan.'), false);
    }
};

// Inisialisasi Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});

module.exports = upload;