// app.js
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
const { closeBrowser } = require('./utils/puppeteerBrowser');

setInterval(async () => {
    console.log('Restart puppeteer browser...');
    await closeBrowser();
}, 1000 * 60 * 30);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
    cors({
        origin: "http://localhost:5173",
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// kalau mau di-import di tempat lain
module.exports = app;
