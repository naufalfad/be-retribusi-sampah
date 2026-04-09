const { Pengajuan, Objek, Subjek, sequelize } = require('../models');
const recordLog = require('../utils/logger');

exports.createPengajuan = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_objek, jenis_pengajuan, data_baru, alasan } = req.body;
        const idSubjek = req.user.id_subjek;

        // 1. Ambil data objek saat ini sebagai snapshot 'data_lama'
        const objekSaatIni = await Objek.findByPk(id_objek);
        if (!objekSaatIni) {
            return res.status(404).json({ message: "Objek tidak ditemukan" });
        }

        // 2. Simpan ke tabel pengajuan
        const file = req.file ? req.file.path : null;

        const newPengajuan = await Pengajuan.create({
            id_objek,
            id_subjek: idSubjek,
            jenis_pengajuan,
            data_lama: objekSaatIni,
            data_baru: data_baru ? JSON.parse(data_baru) : null,
            alasan,
            file_pendukung: file,
            status: 'Pending'
        }, { transaction });

        await transaction.commit();
        res.status(201).json({
            success: true,
            message: "Pengajuan Anda telah dikirim dan menunggu validasi Dinas.",
            data: newPengajuan
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

exports.verifikasiLayanan = async (req, res) => {
    const { id_pengajuan } = req.params;
    const { status, catatan_dinas } = req.body; // status: 'Disetujui' atau 'Ditolak'
    const idStaffDinas = req.user.id_staff; // ID petugas yang memproses

    const transaction = await sequelize.transaction();

    try {
        // 1. Cari data pengajuan
        const pengajuan = await Pengajuan.findByPk(id_pengajuan, { transaction });

        if (!pengajuan) {
            await transaction.rollback();
            return res.status(404).json({ message: "Data pengajuan tidak ditemukan" });
        }

        if (pengajuan.status !== 'Pending') {
            await transaction.rollback();
            return res.status(400).json({ message: "Pengajuan ini sudah diproses sebelumnya" });
        }

        // 2. LOGIKA JIKA DISETUJUI
        if (status === 'Disetujui') {
            const objek = await Objek.findByPk(pengajuan.id_objek, { transaction });

            if (pengajuan.jenis_pengajuan === 'Perubahan Data') {
                // AMBIL DATA DARI JSONB 'data_baru'
                const d = pengajuan.data_baru;

                // UPDATE OTOMATIS TABEL OBJEK BERDASARKAN ISI JSONB
                await objek.update({
                    nama_objek: d.nama_objek ?? objek.nama_objek,
                    alamat_objek: d.alamat_objek ?? objek.alamat_objek,
                    kategori_objek: d.kategori_objek ?? objek.kategori_objek,
                    rt_rw_objek: d.rt_rw_objek ?? objek.rt_rw_objek,
                    kelurahan_objek: d.kelurahan_objek ?? objek.kelurahan_objek,
                    kecamatan_objek: d.kecamatan_objek ?? objek.kecamatan_objek,
                    kabupaten_objek: d.kabupaten_objek ?? objek.kabupaten_objek,
                    provinsi_objek: d.provinsi_objek ?? objek.provinsi_objek,
                    kode_pos_objek: d.kode_pos_objek ?? objek.kode_pos_objek,
                    telepon_objek: d.telepon_objek ?? objek.telepon_objek,
                    // Khusus Koordinat (PostGIS)
                    koordinat_objek: d.latitude && d.longitude
                        ? sequelize.fn('ST_GeomFromText', `POINT(${d.longitude} ${d.latitude})`, 4326)
                        : objek.koordinat_objek
                }, { transaction });

            } else if (pengajuan.jenis_pengajuan === 'Penonaktifan') {
                // Jika penonaktifan, ubah status objek
                await objek.update({ status_objek: 'Non-Aktif' }, { transaction });
            }
        }

        // 3. Update status di tabel Pengajuan
        await pengajuan.update({
            status: status,
            catatan_dinas: catatan_dinas,
            id_staff: idStaffDinas
        }, { transaction });

        // 4. Catat Audit Trail
        await recordLog(req, {
            action: `VERIFY_LAYANAN_${status.toUpperCase()}`,
            module: 'MONITORING_LAYANAN',
            description: `Dinas ${status} pengajuan #${id_pengajuan} untuk Objek ID ${pengajuan.id_objek}`,
            oldData: pengajuan.data_lama,
            newData: status === 'Disetujui' ? pengajuan.data_baru : { catatan: catatan_dinas }
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: `Pengajuan berhasil ${status.toLowerCase()} dan database telah diperbarui.`
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error Verifikasi:", error);
        res.status(500).json({ message: error.message });
    }
};

// Fungsi tambahan untuk list (digunakan di halaman monitoring)
exports.getListPengajuan = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Pengajuan.findAndCountAll({
            where: status ? { status } : {},
            include: [
                { model: Objek, attributes: ['npor_objek'] },
                { model: Subjek, attributes: ['nama_subjek', 'npwrd_subjek'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total_items: count,
                total_pages: Math.ceil(count / limit),
                current_page: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};