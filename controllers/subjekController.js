require('dotenv').config();
const { Subjek, Objek } = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');
const { Op } = require('sequelize');

exports.createSubjek = async (req, res) => {
    try {
        const idStaffLogin = req.auth.id_staff;
        const {
            nama_subjek,
            nik_subjek,
            telepon_subjek,
            email_subjek,
            alamat_subjek,
            rt_rw_subjek,
            kabupaten_subjek,
            kecamatan_subjek,
            kelurahan_subjek,
            kode_pos_subjek,
            password_subjek,
            npwrd_subjek
        } = req.body;

        const dokumen_subjek_path = req.file ? req.file.path : null

        if (!dokumen_subjek_path) {
            return res.status(400).json({ message: 'Dokumen subjek harus diupload.' });
        }

        const hashedPassword = await bcrypt.hash(password_subjek, 10);
        const newSubjek = await Subjek.create({
            id_staff: idStaffLogin,
            nama_subjek,
            nik_subjek,
            telepon_subjek,
            email_subjek,
            alamat_subjek,
            rt_rw_subjek,
            kabupaten_subjek,
            kecamatan_subjek,
            kelurahan_subjek,
            kode_pos_subjek,
            dokumen_subjek: dokumen_subjek_path,
            password_subjek: hashedPassword,
            npwrd_subjek,
            status_subjek: 'Aktif'
        })

        res.status(201).json({
            message: 'NPWRD berhasil dibuat',
            data: newSubjek,
        });
    } catch (error) {
        console.error(error);
        if (req.file) {
            const fs = require('fs');
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Gagal menghapus file yang terupload:", err);
            });
        }
        res.status(500).json({ message: error.message });
    }
}

exports.getDokumenSubjek = async (req, res) => {
    try {
        const { id_subjek } = req.params;
        const subjekData = await Subjek.findByPk(id_subjek)

        if (!subjekData || !subjekData.dokumen_subjek) {
            return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
        }

        res.sendFile(path.resolve(subjekData.dokumen_subjek));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

exports.getListSubjek = async (req, res) => {
    try {
        // 1. Ambil query parameter untuk pagination & search
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // 2. Eksekusi findAndCountAll
        const { count, rows } = await Subjek.findAndCountAll({
            where: {
                // Contoh filter pencarian berdasarkan nama_subjek
                nama_subjek: {
                    [Op.iLike]: `%${search}%` // Gunakan Op.like jika menggunakan MySQL
                }
            },
            include: [{ model: Objek }], // Aktifkan jika ingin menarik data objek terkait
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']], // Urutkan dari yang terbaru
            distinct: true
        });

        // 3. Hitung metadata paginasi
        const totalPages = Math.ceil(count / limit);

        // 4. Kirim response
        res.status(200).json({
            status: 'success',
            message: 'Daftar subjek berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getListSubjek:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
};