const binderbyteService = require("../services/binderByteService");
const { Op } = require('sequelize');
const {
    RefKelurahan,
    RefKecamatan,
    RefKabupaten,
    RefProvinsi
} = require('../models');



exports.provinsi = async (req, res) => {
    try {
        const data = await binderbyteService.getProvinsi();
        res.json({
            success: true,
            data: data.value
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.kabupaten = async (req, res) => {
    try {
        const { provinsi_id } = req.query;
        if (!provinsi_id) {
            return res.status(400).json({
                success: false,
                message: "provinsi_id wajib diisi"
            });
        }

        const data = await binderbyteService.getKabupaten(provinsi_id);
        res.json({
            success: true,
            data: data.value
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.kecamatan = async (req, res) => {
    try {
        const { kabupaten_id } = req.query;
        if (!kabupaten_id) {
            return res.status(400).json({
                success: false,
                message: "kabupaten_id wajib diisi"
            });
        }

        const data = await binderbyteService.getKecamatan(kabupaten_id);
        res.json({
            success: true,
            data: data.value
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.kelurahan = async (req, res) => {
    try {
        const { kecamatan_id } = req.query;
        if (!kecamatan_id) {
            return res.status(400).json({
                success: false,
                message: "kecamatan_id wajib diisi"
            });
        }

        const data = await binderbyteService.getKelurahan(kecamatan_id);
        res.json({
            success: true,
            data: data.value
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.searchKelurahan = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 3) {
            return res.json({ data: [] });
        }

        const data = await RefKelurahan.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${q}%` // MySQL ganti Op.like
                }
            },
            limit: 20,
            include: [
                {
                    model: RefKecamatan,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: RefKabupaten,
                            attributes: ['id', 'name'],
                            include: [
                                {
                                    model: RefProvinsi,
                                    attributes: ['id', 'name']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        const result = data.map(item => ({
            id_kelurahan: item.id,
            kelurahan: item.name,
            kecamatan: item.RefKecamatan?.name,
            kabupaten: item.RefKecamatan?.RefKabupaten?.name,
            provinsi: item.RefKecamatan?.RefKabupaten?.RefProvinsi?.name,
            kodepos: item.kodepos
        }));

        res.json({ data: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};