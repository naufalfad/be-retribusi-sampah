const { LogAktivitas, sequelize } = require("../models");
const { Op } = require('sequelize');


exports.getAuditLogs = async (req, res) => {
    try {
        const { search, modul, page, limit } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        let whereClause = {};

        if (modul && modul !== 'SEMUA') {
            whereClause.modul = modul;
        }

        if (search) {
            whereClause[Op.or] = [
                { deskripsi: { [Op.iLike]: `%${search}%` } },
                { role: { [Op.iLike]: `%${search}%` } },
                { aksi: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await LogAktivitas.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset: offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: rows,
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: pageNum,
                limit: limit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAuditModules = async (req, res) => {
    try {
        // Mengambil nilai unik dari kolom 'modul'
        const modules = await LogAktivitas.findAll({
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('modul')), 'modul']
            ],
            where: {
                modul: { [Op.ne]: null } // Pastikan tidak null
            },
            raw: true
        });

        // Mapping hasil agar hanya mengembalikan array string sederhana
        const moduleList = modules.map(m => m.modul).sort();

        res.json({
            success: true,
            data: moduleList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRiwayatPenagih = async (req, res) => {
    try {
        const idPenagih = req.user.id_penagih; // Dari token login penagih

        // Kita ambil data log aktivitas yang dilakukan oleh user ini 
        // dan gabungkan dengan data SSRD jika perlu
        const logs = await LogAktivitas.findAll({
            where: {
                id_user: idPenagih,
                role: 'Penagih',
                aksi: 'COLLECT_PAYMENT_FIELD'
            },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};