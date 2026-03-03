const binderbyteService = require("../services/binderByteService");
const { Op } = require('sequelize');
const {
    RefKelurahan,
    RefKecamatan,
    RefKabupaten,
    RefProvinsi,
    Skrd, Objek, Penagih, sequelize
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

// Wilayah kerja Penagih
exports.getWilayahKerjaDetail = async (req, res) => {
    try {
        // 1. Ambil Identitas Penagih
        const idPenagih = req.user.id_penagih;
        const profil = await Penagih.findByPk(idPenagih);

        if (!profil) {
            return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
        }

        const kelurahan = profil.kelurahan;

        // 2. Agregasi Data Berdasarkan RT/RW
        // Ini akan menghitung jumlah WR dan jumlah Tunggakan per RT/RW
        const sebaranWilayah = await Objek.findAll({
            where: { kelurahan_objek: kelurahan },
            attributes: [
                'rt_rw_objek',
                [sequelize.fn('COUNT', sequelize.col('Objek.id_objek')), 'total_wr'],
                // Hitung yang memiliki SKRD Unpaid
                [
                    sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM dat_skrd AS s 
                        WHERE s.id_objek = "Objek"."id_objek" 
                        AND s.status = 'unpaid'
                    )`),
                    'jumlah_tunggakan'
                ],
                // Hitung Total Rupiah Tunggakan per RW
                [
                    sequelize.literal(`(
                        SELECT SUM(total_bayar) 
                        FROM dat_skrd AS s 
                        WHERE s.id_objek = "Objek"."id_objek" 
                        AND s.status = 'unpaid'
                    )`),
                    'nominal_tunggakan'
                ]
            ],
            group: ['rt_rw_objek', 'Objek.id_objek'],
            raw: true
        });

        // 3. Sederhanakan data agar dikelompokkan benar-benar per RT/RW di memori Node.js
        // (Karena group by di SQL tingkat objek masih pecah per ID)
        const summaryRT = sebaranWilayah.reduce((acc, curr) => {
            const key = curr.rt_rw_objek || 'Lainnya';
            if (!acc[key]) {
                acc[key] = {
                    rt_rw: key,
                    total_wr: 0,
                    tunggakan_count: 0,
                    nominal_tunggakan: 0
                };
            }
            acc[key].total_wr += parseInt(curr.total_wr);
            acc[key].tunggakan_count += parseInt(curr.jumlah_tunggakan || 0);
            acc[key].nominal_tunggakan += parseFloat(curr.nominal_tunggakan || 0);
            return acc;
        }, {});

        // 4. Hitung Statistik Global Kelurahan
        const totalObjek = await Objek.count({ where: { kelurahan_objek: kelurahan } });
        const totalLunas = await Skrd.count({
            include: [{
                model: Objek,
                where: { kelurahan_objek: kelurahan },
                attributes: []
            }],
            where: { status: 'paid' }
        });

        res.json({
            success: true,
            data: {
                kelurahan: kelurahan,
                statistik: {
                    total_objek: totalObjek,
                    total_lunas: totalLunas,
                    persentase_capaian: totalObjek > 0 ? Math.round((totalLunas / totalObjek) * 100) : 0
                },
                daftar_rt_rw: Object.values(summaryRT).sort((a, b) => b.nominal_tunggakan - a.nominal_tunggakan)
            }
        });

    } catch (error) {
        console.error("Error Wilayah Kerja Detail:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. Ambil Semua Provinsi
exports.getProvinsi = async (req, res) => {
    try {
        const data = await RefProvinsi.findAll();
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// 2. Ambil Kabupaten berdasarkan id_provinsi
exports.getKabupaten = async (req, res) => {
    try {
        const { id_provinsi } = req.params; // Ambil dari URL /kabupaten/:id_provinsi
        const data = await RefKabupaten.findAll({
            where: { id_provinsi: id_provinsi }
        });
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// 3. Ambil Kecamatan berdasarkan id_kabupaten
exports.getKecamatan = async (req, res) => {
    try {
        const { id_kabupaten } = req.params;
        const data = await RefKecamatan.findAll({
            where: { id_kabupaten: id_kabupaten }
        });
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// 4. Ambil Kelurahan berdasarkan id_kecamatan
exports.getKelurahan = async (req, res) => {
    try {
        const { id_kecamatan } = req.params;
        const data = await RefKelurahan.findAll({
            where: { id_kecamatan: id_kecamatan }
        });
        res.json({
            success: true,
            data: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};