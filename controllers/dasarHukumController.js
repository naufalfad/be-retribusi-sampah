const { RefDasarHukum } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.tambahPeraturan = async (req, res) => {
    try {
        const { judul, deskripsi, jenis, tahun } = req.body;

        if (!judul || !jenis || !tahun) {
            return res.status(400).json({
                success: false,
                message: 'Judul, jenis, dan tahun wajib diisi'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File PDF wajib diupload'
            });
        }

        const peraturan = await RefDasarHukum.create({
            judul,
            deskripsi,
            jenis,
            tahun,
            dokumen_peraturan: req.file.path.replace(/\\/g, '/')
        });

        return res.status(201).json({
            success: true,
            message: 'Peraturan berhasil ditambahkan',
            data: peraturan
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Gagal menambahkan peraturan',
            error: error.message
        });
    }
}

exports.getPeraturan = async (req, res) => {
    try {
        const { jenis, search } = req.query;

        const where = {};

        if (jenis && jenis !== 'SEMUA') {
            where.jenis = jenis.toUpperCase();
        }

        if (search) {
            where[Op.or] = [
                { judul: { [Op.iLike || Op.like]: `%${search}%` } },
                { deskripsi: { [Op.iLike || Op.like]: `%${search}%` } }
            ];
        }

        const data = await RefDasarHukum.findAll({
            where,
            order: [['tahun', 'DESC']]
        });

        return res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data peraturan'
        });
    }
};

exports.hapusPeraturan = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await RefDasarHukum.findByPk(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Peraturan tidak ditemukan'
            });
        }

        // Hapus file fisik
        if (data.file_path) {
            const filePath = path.resolve(data.file_path);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Hapus record DB
        await data.destroy();

        return res.json({
            success: true,
            message: 'Peraturan berhasil dihapus'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus peraturan'
        });
    }
};