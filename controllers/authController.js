require('dotenv').config();
const { Staff } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

exports.registerStaff = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Username, password, dan role harus diisi.' });
        }
        if (!['Admin', 'UPT', 'DLH', 'Bendahara'].includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await Staff.create({
            username,
            password: hashedPassword,
            role
        });
        res.status(201).json({
            message: 'Register berhasil',
            staff: {
                username: newStaff.username,
                role: newStaff.role
            },
            newStaff,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.loginStaff = async (req, res) => {
    try {
        const { username, password } = req.body;

        const userStaff = await Staff.findOne({ where: { username } });
        if (!userStaff) return res.status(404).json({ message: 'User tidak ditemukan' });

        const isPasswordValid = await bcrypt.compare(password, userStaff.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Password salah' });

        const token = jwt.sign(
            { id_staff: userStaff.id_staff, username: userStaff.username, role: userStaff.role },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            user: {
                username: userStaff.username,
                role: userStaff.role
            },
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};