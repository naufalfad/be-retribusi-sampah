const { Op } = require('sequelize');
const { Skrd, Ssrd, Objek, Subjek, FormSurat, sequelize } = require('../models');
const { getSsrdHtml } = require('../services/ssrdService');
const { getBrowser } = require('../utils/puppeteerBrowser'); // Sesuaikan path utils Anda

exports.buatSsrd = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            id_skrd,
            payment_method,
            amount_paid,
            paid_at
        } = req.body;

        if (!id_skrd || !payment_method || !amount_paid || !paid_at) {
            await t.rollback();
            return res.status(400).json({
                message: 'Data pembayaran tidak lengkap'
            });
        }

        const skrd = await Skrd.findByPk(id_skrd, { transaction: t });

        if (!skrd) {
            await t.rollback();
            return res.status(404).json({
                message: 'Data SKRD tidak ditemukan'
            });
        }

        if (skrd.status === 'paid') {
            await t.rollback();
            return res.status(400).json({
                message: 'SKRD sudah dibayar'
            });
        }

        /* ================= FORMAT NOMOR SSRD ================= */
        const paidDate = new Date(paid_at);
        if (isNaN(paidDate)) {
            await t.rollback();
            return res.status(400).json({
                message: 'Format tanggal pembayaran tidak valid'
            });
        }

        const dateStr = paidDate
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');

        const uniqueId = Date.now().toString().slice(-6);
        const no_ssrd = `SSRD/${dateStr}/${uniqueId}`;

        /* ================= SIMPAN SSRD ================= */
        const newSsrd = await Ssrd.create({
            id_skrd,
            no_ssrd,
            payment_method,
            amount_paid,
            paid_at: paidDate,
            payment_status: 'paid'
        }, { transaction: t });

        /* ================= UPDATE SKRD ================= */
        await skrd.update({
            status: 'paid'
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            message: 'SSRD berhasil dibuat',
            data_ssrd: newSsrd
        });

    } catch (error) {
        await t.rollback();
        console.error('Error buat SSRD:', error);

        return res.status(500).json({
            message: 'Terjadi kesalahan saat membuat SSRD',
            error: error.message
        });
    }
};

exports.getListSsrd = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.page) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { count, rows } = await Ssrd.findAndCountAll({
            where: {
                no_ssrd: {
                    [Op.iLike]: `%${search}%`
                }
            },
            include: [
                {
                    model: Skrd,
                    attributes: ['id_skrd', 'no_skrd', 'status'],
                    include: [
                        {
                            model: Objek,
                            attributes: ['id_objek', 'nama_objek', 'npor_objek']
                        }]
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            status: 'success',
            message: 'Daftar SSRD berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });
    } catch (error) {
        console.error("Error getListSsrd:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
}

exports.previewSsrdHtml = async (req, res) => {
    try {
        const html = await getSsrdHtml(req.params.id_ssrd);
        res.type('html').send(html);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.cetakSsrdPdf = async (req, res) => {
    try {
        const html = await getSsrdHtml(req.params.id_ssrd);

        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
            });

            res.type('pdf').send(pdf);
        } finally {
            await page.close();
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};