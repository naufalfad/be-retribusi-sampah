const { Staff, LogAktivitas, Skrd, Ssrd, Objek,
    Subjek, FormSurat, Kelas, PetugasLapangan, sequelize
} = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const renderReportHtml = require('../templates/reportTemplate');
const { getBrowser } = require('../utils/puppeteerBrowser');

exports.getSummaryReport = async (req, res) => {
    try {
        const tahunIni = new Date().getFullYear();

        const totalRealisasi = await Ssrd.sum('amount_paid', {
            where: {
                paid_at: { [Op.between]: [`${tahunIni}-01-01`, `${tahunIni}-12-31`] },
                payment_status: { [Op.in]: ['partial', 'paid'] }
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
        if (year) {
            whereSkrd.periode_tahun = parseInt(year);
        }
        if (month && (type === 'bulanan' || type === 'wilayah')) {
            whereSkrd.periode_bulan = parseInt(month);
        }

        // Filter Wilayah
        if (kecamatan && kecamatan !== '') {
            whereObjek.kecamatan_objek = kecamatan;
        }

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
                attributes: ['id_skrd', 'no_skrd', 'status', 'createdAt', 'periode_bulan', 'periode_tahun'],
                where: whereSkrd,
                include: [
                    {
                        model: Objek,
                        where: whereObjek,
                        include: [{ model: Subjek, attributes: ['nama_subjek', 'kategori_subjek'] }]
                    },
                    {
                        model: Ssrd,
                        where: {
                            payment_status: {
                                [Op.in]: ['partial', 'paid']
                            }
                        },
                        attributes: ['amount_paid']
                    }
                ],
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

// Dashboard Admin
exports.getAdminStats = async (req, res) => {
    try {
        // 1. Hitung Jumlah Staff per Role
        const uptCount = await Staff.count({ where: { role: 'UPT' } });
        const dlhCount = await Staff.count({ where: { role: 'DLH' } });
        const bendaharaCount = await Staff.count({ where: { role: 'Bendahara' } });
        const penagihCount = await Staff.count({ where: { role: 'Penagih' } });

        // 2. Ambil 5 Log Aktivitas Terbaru
        const recentLogs = await LogAktivitas.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id_log', 'role', 'aksi', 'deskripsi', 'createdAt']
        });

        // 3. Hitung Antrean Verifikasi (Subjek status Pending)
        // Ini bisa kita gunakan sebagai indikator "Perlu Tindakan" di Dashboard
        const pendingVerification = await Subjek.count({ where: { status_subjek: 'Pending' } });

        // 4. Statistik Objek (Total NPOR Terdaftar)
        const totalObjek = await Objek.count();

        res.json({
            success: true,
            data: {
                counts: {
                    upt: uptCount,
                    dlh: dlhCount,
                    bendahara: bendaharaCount,
                    penagih: penagihCount,
                    pending_subjek: pendingVerification,
                    total_objek: totalObjek
                },
                recentLogs: recentLogs,
                system_info: {
                    db_status: 'Connected',
                    last_backup: new Date().toISOString(), // Placeholder
                    version: 'v2.0.4-Stable'
                }
            }
        });
    } catch (error) {
        console.error("Error Admin Stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Dashboard Unit (UPT)
exports.getUptStats = async (req, res) => {
    try {

        // 1. Hitung Total Subjek yang didaftarkan oleh UPT ini
        const totalSubjek = await Subjek.count({
        });

        // 2. Hitung Total Objek yang didaftarkan oleh UPT ini
        // (Objek yang terhubung ke Subjek yang dibuat oleh staff ini)
        const totalObjek = await Objek.count({
            include: [{
                model: Subjek,
                attributes: []
            }]
        });

        // 3. Breakdown Kategori Subjek (Pribadi vs Badan)
        const kategoriStats = await Subjek.findAll({
            attributes: [
                'kategori_subjek',
                [sequelize.fn('COUNT', sequelize.col('id_subjek')), 'jumlah']
            ],
            group: ['kategori_subjek'],
            raw: true
        });

        // 4. Ambil 5 Inputan Terakhir (Subjek Terbaru)
        const recentSubjek = await Subjek.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: Objek, attributes: ['id_objek'] }] // Untuk hitung jumlah aset per subjek
        });

        // 5. Statistik Kelas Objek yang paling sering diinput (Top 3)
        const topKelas = await Objek.findAll({
            include: [
                { model: Subjek, attributes: [] },
                { model: Kelas, as: 'kelas', attributes: ['nama_kelas'] }
            ],
            attributes: [
                [sequelize.col('kelas.nama_kelas'), 'nama_kelas'],
                [sequelize.fn('COUNT', sequelize.col('Objek.id_objek')), 'jumlah']
            ],
            group: ['kelas.nama_kelas'],
            order: [[sequelize.fn('COUNT', sequelize.col('Objek.id_objek')), 'DESC']],
            limit: 3,
            raw: true
        });

        res.json({
            success: true,
            data: {
                summary: {
                    total_subjek: totalSubjek,
                    total_objek: totalObjek,
                },
                kategori: kategoriStats,
                topKelas: topKelas,
                recentSubjek: recentSubjek
            }
        });

    } catch (error) {
        console.error("Error UPT Stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Dashboard Bendahara
exports.getBendaharaStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));

        // 1. Total Realisasi (Sudah Lunas) - Bulan Ini
        const totalRealisasiBulanIni = await Ssrd.sum('amount_paid', {
            where: {
                payment_status: 'paid',
                paid_at: { [Op.gte]: startOfMonth }
            }
        }) || 0;

        // 2. Penerimaan Hari Ini
        const penerimaanHariIni = await Ssrd.sum('amount_paid', {
            where: {
                payment_status: 'paid',
                paid_at: { [Op.gte]: startOfToday }
            }
        }) || 0;

        // 3. Antrean Rekonsiliasi (SSRD Status Pending)
        // Ini adalah setoran dari PetugasLapangan atau upload mandiri yang belum divalidasi bendahara
        const antreanRekon = await Ssrd.count({
            where: { payment_status: 'pending' }
        });

        // 4. Total Piutang (SKRD yang belum dibayar)
        const totalPiutang = await Skrd.sum('total_bayar', {
            where: { status: 'unpaid' }
        }) || 0;

        // 5. 5 Transaksi Terakhir (SSRD Terverifikasi)
        const recentTransactions = await Ssrd.findAll({
            where: { payment_status: 'paid' },
            limit: 5,
            order: [['updatedAt', 'DESC']],
            include: [{
                model: Skrd,
                include: [{ model: Objek, attributes: ['nama_objek'] }]
            }]
        });

        // 6. Statistik Metode Pembayaran (Tunai vs QRIS vs VA)
        const paymentMethods = await Ssrd.findAll({
            where: { payment_status: 'paid' },
            attributes: [
                'payment_method',
                [sequelize.fn('COUNT', sequelize.col('id_ssrd')), 'jumlah']
            ],
            group: ['payment_method'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                summary: {
                    realisasi_bulan_ini: totalRealisasiBulanIni,
                    realisasi_hari_ini: penerimaanHariIni,
                    antrean_rekon: antreanRekon,
                    total_piutang: totalPiutang
                },
                paymentMethods: paymentMethods,
                recentTransactions: recentTransactions
            }
        });

    } catch (error) {
        console.error("Error Bendahara Stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Dashboard PetugasLapangan
exports.getPenagihStats = async (req, res) => {
    try {
        // 1. Identifikasi PetugasLapangan dari Token
        // Karena login PetugasLapangan sekarang mandiri, ambil ID dari req.user.id_petugas
        const idPetugasLapangan = req.user.id_petugas;

        const profil = await PetugasLapangan.findByPk(idPetugasLapangan);
        if (!profil) {
            return res.status(404).json({ success: false, message: 'Profil PetugasLapangan tidak ditemukan.' });
        }

        const kelurahanTugas = profil.kelurahan;
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));

        // 2. Total Wajib Retribusi di Wilayah Tugas (Berdasarkan Kelurahan)
        const totalWR = await Objek.count({
            where: { kelurahan_objek: kelurahanTugas }
        });

        // 3. Hitung Nominal Tunggakan (SUM SKRD UNPAID)
        // Gunakan attributes: [] untuk menghindari error GROUP BY di Postgres
        const totalRupiahTunggakan = await Skrd.sum('total_bayar', {
            where: { status: 'unpaid' },
            include: [{
                model: Objek,
                attributes: [], // Jangan ambil kolom apapun dari Objek
                where: { kelurahan_objek: kelurahanTugas },
                required: true // Inner Join
            }]
        }) || 0;

        // 4. Hitung Jumlah Dokumen Tunggakan
        const tunggakanCount = await Skrd.count({
            where: { status: 'unpaid' },
            include: [{
                model: Objek,
                attributes: [],
                where: { kelurahan_objek: kelurahanTugas },
                required: true
            }]
        });

        // 5. Uang Tunai di Tangan (Cash Today)
        // Menghitung SSRD 'Tunai' hari ini di wilayah tugas
        const cashToday = await Ssrd.sum('amount_paid', {
            where: {
                payment_method: 'Tunai',
                paid_at: { [Op.gte]: startOfToday }
            },
            include: [{
                model: Skrd,
                attributes: [],
                required: true,
                include: [{
                    model: Objek,
                    attributes: [],
                    where: { kelurahan_objek: kelurahanTugas },
                    required: true
                }]
            }]
        }) || 0;

        // 6. Ambil 5 Koleksi Terakhir untuk List Aktivitas
        const recentCollections = await Ssrd.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Skrd,
                attributes: ['no_skrd'],
                include: [{
                    model: Objek,
                    attributes: ['nama_objek'],
                    include: [{ model: Subjek, attributes: ['nama_subjek'] }]
                }]
            }]
        });

        res.json({
            success: true,
            data: {
                wilayah: kelurahanTugas,
                petugas: profil.username,
                summary: {
                    total_wr: totalWR,
                    jumlah_tunggakan: tunggakanCount,
                    total_tunggakan_idr: totalRupiahTunggakan,
                    cash_today: cashToday
                },
                recentCollections
            }
        });

    } catch (error) {
        console.error("Error PetugasLapangan Stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportPenerimaanPdf = async (req, res) => {
    try {
        const { type, year, month, kecamatan, kategori, jenis_layanan } = req.query;

        let whereSsrd = { payment_status: { [Op.in]: ['paid', 'partial'] } };
        let whereObjek = {};
        let whereKelas = {};

        // 1. Filter Waktu (Berdasarkan paid_at di SSRD)
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31T23:59:59`);

            if (month && type !== 'tahunan') {
                const startMonth = new Date(year, month - 1, 1);
                const endMonth = new Date(year, month, 0, 23, 59, 59);
                whereSsrd.paid_at = { [Op.between]: [startMonth, endMonth] };
            } else {
                whereSsrd.paid_at = { [Op.between]: [startDate, endDate] };
            }
        }

        // 2. Filter Wilayah (Kecamatan)
        if (type === 'wilayah' && kecamatan) {
            whereObjek.kecamatan_objek = kecamatan;
        }

        // 3. Filter Kategori (Rumah Tinggal / Non Rumah Tinggal)
        if (type === 'kategori' && kategori) {
            whereObjek.kategori_objek = kategori;
        }

        // 4. Filter Jenis (Nama Kelas)
        if (type === 'jenis' && jenis_layanan) {
            whereKelas.nama_kelas = jenis_layanan;
        }

        // 5. Eksekusi Query
        const data = await Ssrd.findAll({
            where: whereSsrd,
            include: [{
                model: Skrd,
                required: true,
                include: [
                    {
                        model: Objek,
                        where: whereObjek,
                        required: true,
                        include: [
                            {
                                model: Subjek,
                                attributes: ['nama_subjek', 'npwrd_subjek']
                            },
                            {
                                model: Kelas,
                                as: 'kelas',
                                where: whereKelas,
                                required: true
                            }
                        ]
                    }
                ]
            }],
            order: [['paid_at', 'ASC']]
        });

        // 6. Ambil Config Pemda (Logo, Nama Pejabat)
        const config = await FormSurat.findOne();

        // 7. Generate Info Filter untuk Judul Laporan
        const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        let filterLabel = `TAHUN ${year}`;
        if (month && type !== 'tahunan') filterLabel = `${monthNames[month].toUpperCase()} ${year}`;
        if (kecamatan) filterLabel += ` - KEC. ${kecamatan.toUpperCase()}`;
        if (kategori) filterLabel += ` - ${kategori.toUpperCase()}`;
        if (jenis_layanan) filterLabel += ` - ${jenis_layanan.toUpperCase()}`;

        // 8. Render HTML & Convert to PDF
        const html = renderReportHtml({
            data,
            type: type.toUpperCase(),
            config,
            filterInfo: filterLabel
        });

        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await page.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': `attachment; filename=LAPORAN_PENERIMAAN_${type.toUpperCase()}.pdf`
        });

        return res.send(pdf);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};