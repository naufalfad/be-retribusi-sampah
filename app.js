// app.js
require('dotenv').config();
const express = require("express");
const path = require('path');
const app = express();
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const subjekRoutes = require('./routes/subjekRoutes')
const objekRoutes = require('./routes/objekRoutes');
const skrdRoutes = require('./routes/skrdRoutes');
const formRoutes = require('./routes/formRoutes');
const ssrdRoutes = require('./routes/ssrdRoutes');
const wilayahRoutes = require('./routes/wilayahRoutes');
const dasarHukumRoutes = require('./routes/dasarHukumRoutes');
const reportRoutes = require('./routes/reportRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const logsRoutes = require('./routes/logsRoutes');
const poinRoutes = require('./routes/poinRoutes');
const layananRoutes = require('./routes/layananRoutes');
const tempatSampahRoutes = require('./routes/tempatSampahRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { closeBrowser } = require('./utils/puppeteerBrowser');

setInterval(async () => {
    console.log('Restart puppeteer browser...');
    await closeBrowser();
}, 1000 * 60 * 30);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === 'https://rekas.geocitra.com') {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);
app.use('/api/auth', authRoutes);
app.use('/api/subjek', subjekRoutes);
app.use('/api/objek', objekRoutes);
app.use('/api/skrd', skrdRoutes);
app.use('/api/form', formRoutes);
app.use('/api/ssrd', ssrdRoutes);
app.use('/api/wilayah', wilayahRoutes);
app.use('/api/peraturan', dasarHukumRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/poin', poinRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/tempat-sampah', tempatSampahRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// kalau mau di-import di tempat lain
module.exports = app;
