const { LogAktivitas } = require("../models");
const { Op } = require('sequelize');


exports.getAuditLogs = async (req, res) => {
    try {
        const { search, modul } = req.query;
        let whereClause = {};

        if (modul) {
            whereClause.modul = modul;
        }

        if (search) {
            whereClause[Op.or] = [
                { deskripsi: { [Op.iLike]: `%${search}%` } },
                { role: { [Op.iLike]: `%${search}%` } },
                { aksi: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const logs = await LogAktivitas.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};