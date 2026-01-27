// app.js
const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const subjekRoutes = require('./routes/subjekRoutes')
const objekRoutes = require('./routes/objekRoutes');
const skrdRoutes = require('./routes/skrdRoutes');

app.use(express.json());
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// kalau mau di-import di tempat lain
module.exports = app;
