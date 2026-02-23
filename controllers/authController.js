require('dotenv').config();
const { Staff, Penagih } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const recordLog = require('../utils/logger');
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

        await recordLog(req, {
            action: 'CREATE_DATA_STAFF',
            module: 'MANAJEMEN_STAFF',
            description: `Petugas menambahkan Staff baru ${newStaff.username}`,
            oldData: null,
            newData: {
                username: newStaff.username
            }
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

exports.registerPenagih = async (req, res) => {
    try {
        const { username, password, kelurahan } = req.body;
        if (!username || !password || !kelurahan) {
            return res.status(400).json({ message: 'Username, password, dan kelurahan harus diisi.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPenagih = await Penagih.create({
            username,
            password: hashedPassword,
            kelurahan
        });
        res.status(201).json({
            message: 'Register berhasil',
            penagih: {
                username: newPenagih.username,
                kelurahan: newPenagih.kelurahan
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { count, rows } = await Staff.findAndCountAll({
            where: {
                username: {
                    [Op.iLike]: `%${search}%`
                }
            },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            status: 'success',
            message: 'Daftar staff berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getAllStaff:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
};

exports.resetStaffPassword = async (req, res) => {
    try {
        const { id_staff } = req.params;
        const { newPassword } = req.body;

        // 1. Validasi Input
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password baru minimal 6 karakter.'
            });
        }

        // 2. Cari Staff
        const staff = await Staff.findByPk(id_staff);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff tidak ditemukan.'
            });
        }

        // 3. Hash Password Baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update di Database
        await staff.update({ password: hashedPassword });

        await recordLog(req, {
            action: 'UPDATE_DATA_STAFF',
            module: 'MANAJEMEN_STAFF',
            description: `Petugas mengubah password Staff ${staff.username}`,
            oldData: null,
            newData: {
                username: staff.username
            }
        });

        res.status(200).json({
            success: true,
            message: `Password untuk staff ${staff.username} berhasil diperbarui.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const { id_staff } = req.params;

        // 1. Cari staff
        const staff = await Staff.findByPk(id_staff);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff tidak ditemukan.'
            });
        }

        // 2. (Opsional) Proteksi agar admin tidak menghapus dirinya sendiri
        if (req.user.id_staff === parseInt(id_staff)) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
        }

        // 3. Hapus dari database
        await staff.destroy();

        await recordLog(req, {
            action: 'UPDATE_DATA_STAFF',
            module: 'MANAJEMEN_STAFF',
            description: `Petugas menghapus akun Staff ${staff.username}`,
            oldData: null,
        });

        res.status(200).json({
            success: true,
            message: `Akun staff @${staff.username} telah berhasil dihapus secara permanen.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};