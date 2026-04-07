require('dotenv').config();
const { Staff, PetugasLapangan, Subjek, Sequelize } = require('../models');
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
                role: userStaff.role,
                id_staff: userStaff.id_staff
            },
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

exports.loginSubjek = async (req, res) => {
    try {
        const normalizeNPWRD = (value) => value.replace(/\./g, '');
        const { npwrd_subjek, password_subjek } = req.body;

        const subjek = await Subjek.findOne({
            where: Sequelize.where(
                Sequelize.fn('REPLACE', Sequelize.col('npwrd_subjek'), '.', ''),
                normalizeNPWRD(npwrd_subjek)
            )
        });

        if (!subjek) {
            return res.status(404).json({ message: 'NPWRD tidak ditemukan' });
        }

        const isPasswordValid = await bcrypt.compare(password_subjek, subjek.password_subjek);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const token = jwt.sign(
            {
                id_subjek: subjek.id_subjek,
                npwrd_subjek: subjek.npwrd_subjek,
                nama_subjek: subjek.nama_subjek
            },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            user: {
                id_subjek: subjek.id_subjek,
                npwrd_subjek: subjek.npwrd_subjek,
                nama_subjek: subjek.nama_subjek
            },
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
};

exports.registerPetugasLapangan = async (req, res) => {
    try {
        const { username, password, kelurahan, role } = req.body;
        if (!username || !password || !kelurahan || !role) {
            return res.status(400).json({ message: 'Username, password, dan kelurahan harus diisi.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPetugasLapangan = await PetugasLapangan.create({
            username,
            password: hashedPassword,
            kelurahan,
            role
        });

        await recordLog(req, {
            action: 'CREATE_DATA_PETUGAS_LAPANGAN',
            module: 'MANAJEMEN_PETUGAS_LAPANGAN',
            description: `Petugas menambahkan Petugas Lapangan baru ${newPetugasLapangan.username}`,
            oldData: null,
            newData: {
                username: newPetugasLapangan.username
            }
        });

        res.status(201).json({
            message: 'Register berhasil',
            PetugasLapangan: {
                username: newPetugasLapangan.username,
                kelurahan: newPetugasLapangan.kelurahan
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.loginPetugasLapangan = async (req, res) => {
    try {
        const { username, password } = req.body;

        const userPetugasLapangan = await PetugasLapangan.findOne({ where: { username } });
        if (!userPetugasLapangan) return res.status(404).json({ message: 'User tidak ditemukan' });

        const isPasswordValid = await bcrypt.compare(password, userPetugasLapangan.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Password salah' });

        const token = jwt.sign(
            { id_petugas: userPetugasLapangan.id_petugas, username: userPetugasLapangan.username, kelurahan: userPetugasLapangan.kelurahan, role: userPetugasLapangan.role },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            user: {
                username: userPetugasLapangan.username,
                kelurahan: userPetugasLapangan.kelurahan,
                id_petugas: userPetugasLapangan.id_petugas,
                role: userPetugasLapangan.role
            },
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
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

exports.resetPetugasLapanganPassword = async (req, res) => {
    try {
        const { id_petugas } = req.params;
        const { newPassword } = req.body;

        // 1. Validasi Input
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password baru minimal 6 karakter.'
            });
        }

        // 2. Cari Staff
        const PetugasLapangan = await PetugasLapangan.findByPk(id_petugas);
        if (!PetugasLapangan) {
            return res.status(404).json({
                success: false,
                message: 'Staff tidak ditemukan.'
            });
        }

        // 3. Hash Password Baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update di Database
        await PetugasLapangan.update({ password: hashedPassword });

        await recordLog(req, {
            action: 'UPDATE_DATA_PETUGAS_LAPANGAN',
            module: 'MANAJEMEN_PETUGAS_LAPANGAN',
            description: `Petugas mengubah password Petugas Lapangan ${PetugasLapangan.username}`,
            oldData: null,
            newData: {
                username: PetugasLapangan.username
            }
        });

        res.status(200).json({
            success: true,
            message: `Password untuk staff ${PetugasLapangan.username} berhasil diperbarui.`
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
            action: 'DELETE_DATA_STAFF',
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

exports.deletePetugasLapangan = async (req, res) => {
    try {
        const { id_petugas } = req.params;

        // 1. Cari staff
        const PetugasLapangan = await PetugasLapangan.findByPk(id_petugas);
        if (!PetugasLapangan) {
            return res.status(404).json({
                success: false,
                message: 'PetugasLapangan tidak ditemukan.'
            });
        }

        // 2. (Opsional) Proteksi agar admin tidak menghapus dirinya sendiri
        if (req.user.id_petugas === parseInt(id_petugas)) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
        }

        // 3. Hapus dari database
        await PetugasLapangan.destroy();

        await recordLog(req, {
            action: 'DELETE_DATA_PETUGAS_LAPANGAN',
            module: 'MANAJEMEN_PETUGAS_LAPANGAN',
            description: `Petugas menghapus akun Petugas Lapangan ${PetugasLapangan.username}`,
            oldData: null,
        });

        res.status(200).json({
            success: true,
            message: `Akun PetugasLapangan @${PetugasLapangan.username} telah berhasil dihapus secara permanen.`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllPetugasLapangan = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // Gunakan findAndCountAll agar ada metadata pagination
        const { count, rows } = await PetugasLapangan.findAndCountAll({
            where: {
                username: { [Op.iLike]: `%${search}%` }
            },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            status: 'success',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};