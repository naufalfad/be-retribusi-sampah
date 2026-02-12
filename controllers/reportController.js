const { Skrd, Ssrd, Objek, Subjek, FormSurat, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const renderReportHtml = require('../templates/reportTemplate');
const { getBrowser } = require('../utils/puppeteerBrowser');

exports.getSummaryReport = async (req, res) => {
    try {
        const tahunIni = new Date().getFullYear();

        const totalRealisasi = await Ssrd.sum('amount_paid', {
            where: {
                paid_at: { [Op.between]: [`${tahunIni}-01-01`, `${tahunIni}-12-31`] }
            }
        });

        const totalWR = await Subjek.count({ where: { status_subjek: 'Aktif' } });

        const totalSkrd = await Skrd.count();
        const skrdLunas = await Skrd.count({ where: { status: 'paid' } });
        const tingkatKepatuhan = totalSkrd > 0 ? (skrdLunas / totalSkrd) * 100 : 0;

        res.json({
            success: true,
            data: {
                realisasi: totalRealisasi || 0,
                wajib_retribusi: totalWR,
                kepatuhan: tingkatKepatuhan.toFixed(2) + '%',
                target_apbd: 120500000000
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRegionalReport = async (req, res) => {
    try {
        const data = await Skrd.findAll({
            attributes: [
                [col('Objek.kecamatan_objek'), 'kecamatan'],
                [fn('SUM', col('total_bayar')), 'total_tagihan'],
                [fn('COUNT', col('id_skrd')), 'jumlah_skrd']
            ],
            include: [{
                model: Objek,
                attributes: [],
                required: true
            }],
            where: { status: 'paid' },
            group: ['Objek.kecamatan_objek'],
            raw: true
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDetailedReport = async (req, res) => {
    try {
        const { type, year, month, kecamatan, search } = req.query;
        let whereSkrd = {};
        let whereObjek = {};

        // Filter Tahun & Bulan
        if (year) whereSkrd.periode_tahun = { [Op.eq]: `${year}-01-01` };
        if (month && type === 'bulanan') {
            // Logika filter bulan sesuai struktur data periode_bulan Anda
        }

        // Filter Wilayah
        if (kecamatan) whereObjek.kecamatan_objek = kecamatan;

        let data;

        if (type === 'wr_aktif') {
            // LAPORAN 1: List Wajib Retribusi Aktif
            data = await Subjek.findAll({
                where: { status_subjek: 'Aktif', nama_subjek: { [Op.iLike]: `%${search || ''}%` } },
                include: [{ model: Objek, attributes: ['nama_objek', 'alamat_objek', 'kecamatan_objek'] }]
            });
        } else {
            // LAPORAN 2, 3, 4: Penerimaan (Tahunan/Bulanan/Wilayah)
            data = await Skrd.findAll({
                attributes: [
                    'id_skrd', 'no_skrd', 'total_bayar', 'status', 'createdAt',
                    [col('Objek.Subjek.kategori_subjek'), 'kategori_wp']
                ],
                where: {
                    ...whereSkrd,
                    status: 'paid' // Hanya yang sudah lunas untuk laporan penerimaan
                },
                include: [{
                    model: Objek,
                    where: whereObjek,
                    include: [{ model: Subjek, attributes: ['nama_subjek', 'kategori_subjek'] }]
                }],
                order: [['createdAt', 'DESC']]
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportReportPdf = async (req, res) => {
    try {
        // 1. Ambil data (Gunakan logika pencarian yang sama dengan getDetailedReport sebelumnya)
        const { type, year, month, kecamatan } = req.query;
        const data = await fetchReportDataFromDb(req.query); // Fungsi pembantu ambil data dari DB

        // 2. Ambil Config Dinas (Logo, Nama Pejabat)
        const config = await FormSurat.findOne();

        // 3. Generate HTML
        const filterInfo = `${month || ''} ${year || ''} ${kecamatan || ''}`.trim();
        const html = renderReportHtml({ data, type, config, filterInfo });

        // 4. Puppeteer Process
        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true, // WAJIB: Agar tabel muat
            printBackground: true
        });

        await page.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': `attachment; filename=Laporan_REKAS_${type}.pdf`
        });

        return res.send(pdf);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};