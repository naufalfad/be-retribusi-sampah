require('dotenv').config();
const { Op } = require('sequelize');
const { Skrd, Ssrd, Objek, Subjek, PoinObjek, PenukaranPoin, sequelize } = require('../models');
const { getSsrdHtml } = require('../services/ssrdService');
const { getBrowser } = require('../utils/puppeteerBrowser');
const recordLog = require('../utils/logger');
const midtransClient = require('midtrans-client');

// Setup Midtrans Snap
let snap = new midtransClient.Snap({
    isProduction: false, // Set ke true jika sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});


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
        const usedPoints = parseInt(points_used) || 0;
        const pointValue = usedPoints * 10;

        /* ================= SIMPAN SSRD ================= */
        const newSsrd = await Ssrd.create({
            id_skrd,
            no_ssrd,
            payment_method,
            amount_paid,
            paid_at: paidDate,
            payment_status: 'paid',
            points_used: usedPoints,
            point_value: pointValue
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

exports.getListSsrdPaid = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const { count, rows } = await Ssrd.findAndCountAll({
            where: {
                no_ssrd: {
                    [Op.iLike]: `%${search}%`
                },
                [Op.or]: [
                    { payment_status: 'paid' },
                    { payment_status: 'partial' }
                ]
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
            paid_at,
            points_used = 0
        } = req.body;

        if (!id_skrd || !payment_method || !amount_paid || !paid_at) {
            await t.rollback();
            return res.status(400).json({
                message: 'Data pembayaran tidak lengkap'
            });
        }

        const skrd = await Skrd.findByPk(id_skrd, {
            include: [{ model: Objek }],
            transaction: t
        });

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

        // NORMALISASI POINT
        const usedPoints = parseInt(points_used) || 0;
        const pointValue = usedPoints * 10;

        // HANDLE POIN (TANPA LIHAT PAYMENT METHOD)
        if (usedPoints > 0) {
            const poinObjek = await PoinObjek.findOne({
                where: { id_objek: skrd.id_objek }, // pastikan field ini benar
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!poinObjek) {
                await t.rollback();
                return res.status(404).json({
                    message: 'Data poin objek tidak ditemukan'
                });
            }

            if (poinObjek.saldo_poin < usedPoints) {
                await t.rollback();
                return res.status(400).json({
                    message: 'Saldo poin tidak mencukupi'
                });
            }

            // UPDATE SALDO
            await poinObjek.update({
                saldo_poin: poinObjek.saldo_poin - usedPoints,
                total_poin_digunakan: (poinObjek.total_poin_digunakan || 0) + usedPoints
            }, { transaction: t });

            // INSERT PENUKARAN
            await PenukaranPoin.create({
                id_objek: skrd.id_objek,
                id_skrd,
                jumlah_poin: usedPoints,
                nilai_rupiah: usedPoints * 10,
                status: 'used'
            }, { transaction: t });
        }

        /* ================= SIMPAN SSRD ================= */
        const newSsrd = await Ssrd.create({
            id_skrd,
            no_ssrd,
            payment_method,
            amount_paid,
            paid_at: paidDate,
            payment_status: 'pending',
            points_used: usedPoints,
            point_value: pointValue
        }, { transaction: t });

        /* ================= UPDATE SKRD ================= */
        await skrd.update({
            status: 'pending'
        }, { transaction: t });

        await recordLog(req, {
            action: 'COLLECT_PAYMENT_FIELD',
            module: 'PENAGIHAN_LAPANGAN',
            description: `Penagih ${req.user.username} menerima setoran ${payment_method} senilai Rp${amount_paid.toLocaleString()} ${points_used > 0 ? `dengan potongan ${points_used} poin` : ''} dari SKRD ${skrd.no_skrd}`,
            oldData: null,
            newData: {
                no_ssrd: newSsrd.no_ssrd,
                nominal: amount_paid,
                metode: payment_method,
                poin_digunakan: points_used
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
        // 1. Cari data SSRD (Pending) yang dikirim PetugasLapangan
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

exports.initiateMidtransPayment = async (req, res) => {
    try {
        const { id_skrd, use_points } = req.body;
        const role = req.user.role;

        const frontendUrl = process.env.FRONTEND_URL;
        let finishUrl = "";

        if (role === 'Penagih') {
            finishUrl = `${frontendUrl}/penagih/list-skrd`;
        } else {
            finishUrl = `${frontendUrl}/skrd`;
        }

        // 1. Ambil data SKRD
        const skrd = await Skrd.findByPk(id_skrd, {
            include: [{ model: Objek, include: [Subjek, PoinObjek] }]
        });

        if (!skrd || skrd.status === 'paid') {
            return res.status(400).json({ message: "Tagihan tidak tersedia atau sudah lunas" });
        }

        // 2. Logika Poin (Redeem)
        let discount = 0;
        let pointsToUse = 0;
        const POINT_VALUE = 10; // 1 Poin = Rp 10

        if (use_points) {
            const saldoPoin = skrd.Objek.PoinObjek?.saldo_poin || 0;
            discount = Math.min(saldoPoin * POINT_VALUE, parseFloat(skrd.total_bayar));
            pointsToUse = discount / POINT_VALUE;
        }

        const finalAmount = Math.round(parseFloat(skrd.total_bayar) - discount);
        const orderId = `REKAS-${skrd.id_skrd}-${Date.now()}`;

        // 3. Payload Midtrans
        let parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: finalAmount
            },
            callbacks: {
                finish: finishUrl,
                error: finishUrl,
                pending: finishUrl
            },
            customer_details: {
                first_name: skrd.Objek.Subjek.nama_subjek,
                email: skrd.Objek.Subjek.email_subjek,
                phone: skrd.Objek.Subjek.telepon_subjek,
                notes: role === 'Penagih' ? `Bantuan petugas: ${req.user.username}` : ""
            },
            item_details: [
                {
                    id: skrd.no_skrd,
                    price: finalAmount,
                    quantity: 1,
                    name: `Retribusi Sampah - ${skrd.Objek.nama_objek}`
                }
            ]
        };

        // 4. Minta Token ke Midtrans
        const transaction = await snap.createTransaction(parameter);

        // 5. Simpan metadata ke SSRD (Status: pending)
        // Kita buat record SSRD "Draft" untuk menampung snap_token
        await Ssrd.create({
            id_skrd: skrd.id_skrd,
            midtrans_order_id: orderId,
            snap_token: transaction.token,
            amount_paid: finalAmount,
            payment_method: 'midtrans',
            payment_status: 'pending',
            points_used: pointsToUse,
            point_value: discount
        });

        res.json({
            success: true,
            snap_token: transaction.token,
            order_id: orderId,
            redirect_url: finishUrl
        });

    } catch (error) {
        console.error("Midtrans Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.handleMidtransNotification = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { order_id, transaction_status } = req.body;

        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            const ssrd = await Ssrd.findOne({ where: { midtrans_order_id: order_id }, transaction: t });
            const skrd = await Skrd.findByPk(ssrd.id_skrd, { transaction: t });

            /* ================= REUSE LOGIKA DARI buatSsrd ================= */
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const uniqueId = Date.now().toString().slice(-6);
            const no_ssrd_resmi = `SSRD/${dateStr}/${uniqueId}`;

            // Update SSRD dari Pending ke Paid dan beri Nomor Resmi
            await ssrd.update({
                no_ssrd: no_ssrd_resmi,
                payment_status: 'paid',
                paid_at: now
            }, { transaction: t });

            // Update SKRD jadi Lunas
            await skrd.update({ status: 'paid' }, { transaction: t });

            // Potong Poin (Jika ada)
            if (ssrd.points_used > 0) {
                const objek = await Objek.findByPk(skrd.id_objek, { transaction: t });
                await PoinObjek.decrement('saldo_poin', {
                    by: ssrd.points_used,
                    where: { id_objek: objek.id_objek },
                    transaction: t
                });
            }

            // Catat Log
            await recordLog(req, {
                action: 'PAYMENT_ONLINE_SUCCESS',
                module: 'MANAJEMEN_SSRD',
                description: `Pembayaran Online Berhasil: ${no_ssrd_resmi}`,
            }, { transaction: t });

            await t.commit();
            return res.status(200).send('OK');
        }

        await t.rollback();
        res.status(200).send('OK');
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

exports.getListSsrdSaya = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const id_subjek = req.user.id_subjek;

        const { count, rows } = await Ssrd.findAndCountAll({
            where: {
                no_ssrd: {
                    [Op.iLike]: `%${search}%`
                },
                [Op.or]: [
                    { payment_status: 'paid' },
                    { payment_status: 'partial' }
                ]
            },
            include: [
                {
                    model: Skrd,
                    attributes: ['id_skrd', 'no_skrd', 'status', 'total_bayar'],
                    required: true,
                    include: [
                        {
                            model: Objek,
                            attributes: ['id_objek', 'nama_objek', 'npor_objek'],
                            where: {
                                id_subjek: id_subjek
                            },
                            required: true
                        }
                    ]
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
            message: 'Gagal mengambil data SSRD',
            error: error.message
        });
    }
};