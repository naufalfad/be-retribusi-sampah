const { Op } = require('sequelize');
const {
    RefKelurahan,
    RefKecamatan,
    RefKabupaten,
    RefProvinsi,
    Skrd, Objek, PetugasLapangan, sequelize
} = require('../models');

exports.searchKelurahan = async (req, res) => {
    try {
        const { q } = req.query;

        const whereClause = q
            ? {
                name: {
                    [Op.iLike]: `%${q}%`
                }
            }
            : {};

        const data = await RefKelurahan.findAll({
            where: whereClause,
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

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Wilayah kerja PetugasLapangan
exports.getWilayahKerjaDetail = async (req, res) => {
    try {
        // 1. Ambil Identitas PetugasLapangan
        const idPetugasLapangan = req.user.id_petugas;
        const profil = await PetugasLapangan.findByPk(idPetugasLapangan);

        if (!profil) {
            return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
        }

        const kelurahan = profil.kelurahan;
        const bulan = req.query.bulan || new Date().getMonth() + 1;
        const tahun = req.query.tahun || new Date().getFullYear();

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
        const totalObjekLunasBulanIni = await Skrd.count({
            distinct: true,
            col: 'id_objek',
            include: [{
                model: Objek,
                where: { kelurahan_objek: kelurahan },
                attributes: []
            }],
            where: {
                status: 'paid',
                updatedAt: {
                    [Op.gte]: new Date(tahun, bulan - 1, 1),
                    [Op.lt]: new Date(tahun, bulan, 1)
                }
            }
        });

        res.json({
            success: true,
            data: {
                kelurahan: kelurahan,
                statistik: {
                    total_objek: totalObjek,
                    total_lunas: totalObjekLunasBulanIni,
                    persentase_capaian: totalObjek > 0
                        ? Math.round((totalObjekLunasBulanIni / totalObjek) * 100)
                        : 0
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