const { Objek, Kelas, Skrd, Subjek, RefPelayanan, RefPelayananSkrd, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getSkrdHtml } = require('../services/skrdService');
const { getBrowser } = require('../utils/puppeteerBrowser');
const recordLog = require('../utils/logger');

exports.penetapanSkrd = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            id_objek,
            pelayanan_ids = [],
            volume_sampah_objek,
            periode_bulan,
            periode_tahun,
            masa
        } = req.body;

        // 1. Cari data Objek dan sertakan data Kelas (Eager Loading)
        // Pastikan di model Objek sudah ada: this.belongsTo(models.Kelas, { foreignKey: 'id_kelas', as: 'kelas' })
        const objek = await Objek.findByPk(id_objek, {
            include: [{
                model: Kelas,
                as: 'kelas',
                include: [{
                    model: RefPelayanan,
                    as: 'pelayanan'
                }]
            }],
            transaction
        });

        if (!objek || !objek.kelas) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Objek / Kelas tidak ditemukan' });
        }

        const isRumahTinggal = !!objek.kelas.tarif_kelas;
        const volume = pelayanan_ids.length > 0
            ? parseFloat(volume_sampah_objek) || 0
            : 0;

        const jumlahMasa = isRumahTinggal
            ? parseInt(masa) || 1
            : 1;

        const denda = 0;

        const pelayananDipilih = objek.kelas.pelayanan.filter(p =>
            pelayanan_ids.includes(p.id_pelayanan)
        );

        if (pelayanan_ids.length && pelayananDipilih.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Pelayanan yang dipilih tidak valid untuk kelas ini'
            });
        }

        const totalPelayanan = pelayananDipilih.reduce((sum, p) => {
            return sum + (parseFloat(p.tarif_pelayanan) || 0) * volume;
        }, 0);

        const tarifFlat = isRumahTinggal
            ? parseFloat(objek.kelas.tarif_kelas) || 0
            : 0;

        const tarifPokokPerBulan = tarifFlat + totalPelayanan;
        const totalBayar = (tarifPokokPerBulan * jumlahMasa) + denda;

        const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const no_skrd = `SKRD/${periode_tahun}/${periode_bulan}/${uniqueId}`;

        const jatuh_tempo = new Date();
        jatuh_tempo.setMonth(jatuh_tempo.getMonth() + 1);

        // 8. Simpan ke tabel SKRD
        const newSkrd = await Skrd.create({
            id_objek,
            no_skrd,
            periode_bulan,
            periode_tahun,
            masa: jumlahMasa,
            jatuh_tempo: jatuh_tempo,
            denda: denda || null,
            total_bayar: totalBayar,
            status: 'unpaid',
            tipe_skrd: 'Skrd'
        }, { transaction });

        const pelayananSkrdData = pelayananDipilih.map(p => ({
            id_skrd: newSkrd.id_skrd,
            id_pelayanan: p.id_pelayanan,
            nama_pelayanan: p.nama_pelayanan,
            tarif_pelayanan: p.tarif_pelayanan,
            volume: volume,
            sub_total: p.tarif_pelayanan * volume
        }));

        if (pelayananSkrdData.length > 0) {
            await RefPelayananSkrd.bulkCreate(pelayananSkrdData, { transaction });
        }
        if (!isRumahTinggal && pelayanan_ids.length === 0) {
            throw new Error("Minimal pilih 1 pelayanan untuk non rumah tinggal");
        }

        await recordLog(req, {
            action: 'CREATE_DATA_SKRD',
            module: 'MANAJEMEN_SKRD',
            description: `Petugas menetapkan SKRD baru ${newSkrd.no_skrd}`,
            oldData: null,
            newData: {
                no_skrd: newSkrd.no_skrd
            }
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Penetapan SKRD berhasil',
            meta: {
                jenis_objek: isRumahTinggal ? 'Rumah Tinggal' : 'Non Rumah Tinggal',
                masa: jumlahMasa,
                volume
            },
            breakdown: {
                tarif_flat: tarifFlat,
                pelayanan: pelayananDipilih.map(p => ({
                    id_pelayanan: p.id_pelayanan,
                    nama: p.nama_pelayanan,
                    tarif: p.tarif_pelayanan,
                    subtotal: p.tarif_pelayanan * volume
                })),
                total_per_bulan: tarifPokokPerBulan
            },
            data_skrd: newSkrd
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getListSkrd = async (req, res) => {
    try {
        // 1. Ambil query parameter untuk pagination & search
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // 2. Eksekusi findAndCountAll
        const { count, rows } = await Skrd.findAndCountAll({
            where: {
                no_skrd: {
                    [Op.iLike]: `%${search}%`
                }
            },
            include: [
                {
                    model: Objek,
                    attributes: ['id_objek', 'npor_objek', 'nama_objek', 'alamat_objek', 'tarif_pokok_objek'],
                    include: [
                        {
                            model: Subjek,
                            attributes: ['id_subjek', 'npwrd_subjek', 'nama_subjek']
                        },
                        {
                            model: Kelas,
                            as: 'kelas',
                            attributes: [
                                'id_kelas', 'nama_kelas', 'tarif_kelas'
                            ],
                            include: [{
                                model: RefPelayanan,
                                as: 'pelayanan',
                                attributes: [
                                    'id_pelayanan', 'nama_pelayanan', 'tarif_pelayanan'
                                ]
                            }]
                        }
                    ]
                }
            ],
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
            message: 'Daftar SKRD berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getListSkrd:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
};

exports.previewSkrdHtml = async (req, res) => {
    try {
        const html = await getSkrdHtml(req.params.id_skrd);
        res.type('html').send(html);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.cetakSkrdPdf = async (req, res) => {
    try {
        const html = await getSkrdHtml(req.params.id_skrd);

        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true
            });

            res.type('pdf').send(pdf);
        } finally {
            await page.close();
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.unpaidSkrdList = async (req, res) => {
    try {
        // 1. Ambil query parameter untuk pagination & search
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // 2. Eksekusi findAndCountAll
        const { count, rows } = await Skrd.findAndCountAll({
            where: {
                no_skrd: {
                    [Op.iLike]: `%${search}%`
                },
                status: 'unpaid'
            },
            include: [
                {
                    model: Objek,
                    attributes: ['id_objek', 'npor_objek', 'nama_objek', 'alamat_objek', 'tarif_pokok_objek'],
                    include: [
                        {
                            model: Subjek,
                            attributes: ['id_subjek', 'npwrd_subjek', 'nama_subjek']
                        }
                    ]
                }
            ],
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
            message: 'Daftar SKRD berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getListSkrd:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
};

exports.generateSkrdKurangBayar = async (req, res) => {
    const { id_skrd_lama, nominal_kurang } = req.body;

    try {
        const skrdLama = await Skrd.findByPk(id_skrd_lama);

        const skrdBaru = await Skrd.create({
            id_objek: skrdLama.id_objek,
            no_skrd: `${skrdLama.no_skrd}/KB`,
            total_bayar: nominal_kurang,
            status: 'unpaid',
            tipe_skrd: 'Kurang Bayar',
            parent_id: id_skrd_lama,
            periode_bulan: skrdLama.periode_bulan,
            periode_tahun: skrdLama.periode_tahun,
            masa: skrdLama.masa,
            jatuh_tempo: skrdLama.jatuh_tempo,
            denda: skrdLama.denda
        });

        res.status(201).json({ success: true, data: skrdBaru });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};