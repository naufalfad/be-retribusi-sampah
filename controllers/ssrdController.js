const { Op } = require('sequelize');
const { Skrd, Ssrd, Objek, Subjek, FormSurat, sequelize } = require('../models');
const { getSsrdHtml } = require('../services/ssrdService');
const { getBrowser } = require('../utils/puppeteerBrowser');
const recordLog = require('../utils/logger');

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

        await recordLog(req, {
            action: 'CREATE_DATA_SSRD',
            module: 'MANAJEMEN_SSRD',
            description: `Petugas menambahkan SSRD baru ${newSsrd.no_ssrd}`,
            oldData: null,
            newData: {
                no_ssrd: newSsrd.no_ssrd
            }
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
                    attributes: ['id_skrd', 'no_skrd', 'status', 'total_bayar'],
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
};

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

exports.paymentPenagih = async (req, res) => {
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
            payment_status: 'pending'
        }, { transaction: t });

        /* ================= UPDATE SKRD ================= */
        await skrd.update({
            status: 'pending'
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

exports.verifikasiPembayaran = async (req, res) => {
    const {
        id_ssrd,
        action, // 'approve' atau 'reject'
        nominal_real,
        alasan_tolak,
        catatan
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // 1. Cari data SSRD (Pending) yang dikirim penagih
        const ssrdPending = await Ssrd.findByPk(id_ssrd, {
            include: [{ model: Skrd, include: [Objek] }],
            transaction
        });

        if (!ssrdPending) {
            return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
        }

        const skrdAsal = ssrdPending.Skrd;

        // --- SKENARIO 1: APPROVE (SETUJU) ---
        if (action === 'approve') {
            // Update status SSRD menjadi lunas
            await ssrdPending.update({
                payment_status: 'paid',
                // verified_at: new Date(),
                // verified_by: req.user.id
            }, { transaction });

            // Update status SKRD asal menjadi paid
            await skrdAsal.update({ status: 'paid' }, { transaction });

            await transaction.commit();
            return res.json({
                success: true,
                message: 'Pembayaran disetujui, SSRD resmi telah diterbitkan.'
            });
        }

        // --- SKENARIO 2: REJECT (TOLAK) ---
        if (action === 'reject') {
            // A. Jika penolakan karena "Kurang Bayar"
            if (alasan_tolak === 'Kurang Bayar') {
                const selisih = skrdAsal.total_bayar - nominal_real;

                if (selisih > 0) {
                    // 1. Generate SKRD Kurang Bayar (SKRDKB)
                    await Skrd.create({
                        id_objek: skrdAsal.id_objek,
                        no_skrd: `${skrdAsal.no_skrd}/KB`, // Penomoran otomatis KB
                        total_bayar: selisih,
                        status: 'unpaid',
                        tipe_skrd: 'Kurang Bayar',
                        parent_id: skrdAsal.id_skrd, // Referensi ke SKRD lama
                        masa: skrdAsal.masa,
                        periode_bulan: skrdAsal.periode_bulan,
                        periode_tahun: skrdAsal.periode_tahun,
                        jatuh_tempo: skrdAsal.jatuh_tempo,
                        denda: skrdAsal.denda
                    }, { transaction });

                    // 2. Tandai SSRD lama sebagai 'partial' (Dibayar Sebagian)
                    await ssrdPending.update({
                        payment_status: 'partial',
                        amount_paid: nominal_real,
                        catatan_bendahara: `Kurang bayar. Diterima Rp${nominal_real}. Selisih Rp${selisih} diterbitkan SKRD-KB.`,
                        rejected_reason: alasan_tolak
                    }, { transaction });

                    // 3. SKRD Asal tetap 'unpaid' atau 'partial'
                    await skrdAsal.update({ status: 'partial' }, { transaction });
                }
            } else {
                // B. Penolakan Umum (Bukti palsu, dana tidak masuk, dll)
                await ssrdPending.update({
                    payment_status: 'rejected',
                    rejected_reason: alasan_tolak,
                    catatan_bendahara: catatan
                }, { transaction });

                // Kembalikan SKRD ke status 'unpaid' agar bisa dibayar ulang
                await skrdAsal.update({ status: 'unpaid' }, { transaction });
            }

            await transaction.commit();
            return res.json({
                success: true,
                message: 'Pembayaran ditolak. Wajib Retribusi akan diminta melakukan perbaikan/pelunasan sisa.'
            });
        }

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan audit' });
    }
};

exports.getListPending = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.page) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { count, rows } = await Ssrd.findAndCountAll({
            where: {
                no_ssrd: {
                    [Op.iLike]: `%${search}%`
                },
                payment_status: 'pending'
            },
            include: [
                {
                    model: Skrd,
                    attributes: ['id_skrd', 'no_skrd', 'status', 'total_bayar'],
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
};

// exports.verifikasiPembayaranFinal = async (req, res) => {
//     const {
//         id_ssrd,
//         nominal_real_bank, // Nominal yang benar-benar ada di mutasi bank
//         catatan_bendahara
//     } = req.body;

//     const transaction = await sequelize.transaction();

//     try {
//         // 1. Ambil data SSRD yang diajukan beserta data SKRD-nya
//         const ssrdPending = await Ssrd.findByPk(id_ssrd, {
//             include: [{ model: Skrd }],
//             transaction
//         });

//         if (!ssrdPending) {
//             return res.status(404).json({ success: false, message: 'Data SSRD tidak ditemukan' });
//         }

//         const skrdInduk = ssrdPending.Skrd;
//         const selisihKurang = skrdInduk.total_bayar - nominal_real_bank;

//         // 2. UPDATE SSRD YANG ADA (Menjadi Bukti Sah Uang Masuk)
//         // Walaupun kurang, uang ini sudah sah masuk ke Kas Daerah
//         await ssrdPending.update({
//             amount_paid: nominal_real_bank, // Pastikan mencatat nominal real bank
//             payment_status: 'paid', // Transaksi spesifik ini dinyatakan selesai/sah
//             verified_at: new Date(),
//             verified_by: req.user.id, // ID Bendahara yang login
//             catatan_bendahara: catatan_bendahara || 'Rekonsiliasi sesuai mutasi bank'
//         }, { transaction });

//         // 3. LOGIKA JIKA ADA SELISIH KURANG
//         if (selisihKurang > 0) {
//             // A. Update Status SKRD Induk menjadi 'partial'
//             await skrdInduk.update({
//                 status: 'partial'
//             }, { transaction });

//             // B. Generate SKRD Baru (Kurang Bayar)
//             // Dokumen ini yang nantinya akan ditagih kembali ke WR
//             await Skrd.create({
//                 id_objek: skrdInduk.id_objek,
//                 no_skrd: `${skrdInduk.no_skrd}/KB`, // Penomoran dengan suffix Kurang Bayar
//                 total_bayar: selisihKurang,
//                 status: 'unpaid',
//                 tipe_skrd: 'Kurang Bayar', // Flag penanda di database
//                 parent_id: skrdInduk.id_skrd, // Menghubungkan ke tagihan asli
//                 masa: skrdInduk.masa,
//                 periode_bulan: skrdInduk.periode_bulan,
//                 periode_tahun: skrdInduk.periode_tahun,
//                 keterangan: `Kekurangan bayar dari tagihan ${skrdInduk.no_skrd}`
//             }, { transaction });

//             await transaction.commit();
//             return res.status(200).json({
//                 success: true,
//                 message: `Setoran Rp${nominal_real_bank.toLocaleString()} disetujui. Otomatis menerbitkan SKRD Kurang Bayar sebesar Rp${selisihKurang.toLocaleString()}.`,
//                 status_pembayaran: 'PARTIAL'
//             });
//         }

//         // 4. LOGIKA JIKA BAYAR PAS ATAU LEBIH
//         else {
//             // Update SKRD Induk menjadi lunas total
//             await skrdInduk.update({ status: 'paid' }, { transaction });

//             await transaction.commit();
//             return res.status(200).json({
//                 success: true,
//                 message: 'Pembayaran Lunas. SSRD Sah telah diterbitkan.',
//                 status_pembayaran: 'PAID'
//             });
//         }

//     } catch (error) {
//         if (transaction) await transaction.rollback();
//         console.error("Error Audit Bendahara:", error);
//         res.status(500).json({ success: false, message: 'Gagal memproses audit rekonsiliasi' });
//     }
// };