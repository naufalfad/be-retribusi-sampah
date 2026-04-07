require('dotenv').config();
const { Op } = require('sequelize');
const { PoinObjek, RefPelayanan,
    Objek, DokumenObjek, Kelas, Subjek, Skrd, sequelize } = require('../models');
const { findOrCreateByName } = require('../utils/refHelper');
const recordLog = require('../utils/logger');

exports.createObjek = async (req, res) => {
    // 1. Validasi awal di luar transaksi agar tidak membebani DB
    const { id_subjek } = req.params;
    const { koordinat_objek } = req.body;

    if (koordinat_objek && !koordinat_objek.includes(',')) {
        return res.status(400).json({ message: 'Format koordinat harus latitude,longitude' });
    }

    const koordinat = koordinat_objek
        ? {
            type: 'Point',
            coordinates: koordinat_objek.split(',').map(Number).reverse() // Long, Lat
        }
        : null;

    // Mulai Transaction
    const transaction = await sequelize.transaction();

    try {
        const {
            id_kelas, kategori_objek, nama_objek, alamat_objek, rt_rw_objek, telepon_objek,
            provinsi_objek, kabupaten_objek, kecamatan_objek, kelurahan_objek,
            kode_pos_objek
        } = req.body;

        // const provinsi = await findOrCreateByName(
        //     RefProvinsi,
        //     provinsi_objek,
        //     {},
        //     transaction
        // );

        // const kabupaten = await findOrCreateByName(
        //     RefKabupaten,
        //     kabupaten_objek,
        //     provinsi ? { id_provinsi: provinsi.id } : {},
        //     transaction
        // );

        // const kecamatan = await findOrCreateByName(
        //     RefKecamatan,
        //     kecamatan_objek,
        //     kabupaten ? { id_kabupaten: kabupaten.id } : {},
        //     transaction
        // );

        // const kelurahan = await findOrCreateByName(
        //     RefKelurahan,
        //     kelurahan_objek,
        //     kecamatan ? { id_kecamatan: kecamatan.id } : {},
        //     transaction
        // );

        // await findOrCreateByName(
        //     RefKodepos,
        //     kode_pos_objek,
        //     kelurahan ? { id_kelurahan: kelurahan.id } : {},
        //     transaction
        // );

        const kelas = await Kelas.findByPk(id_kelas, {
            attributes: ['id_kelas', 'tarif_kelas']
        });
        const tarif = kelas?.tarif_kelas ?? null;

        const nporGenerated = await generateNPOR();
        console.time("DB_Insert_Objek");
        const newObjek = await Objek.create({
            id_subjek,
            id_kelas,
            npor_objek: nporGenerated,
            kategori_objek,
            nama_objek,
            alamat_objek,
            rt_rw_objek,
            telepon_objek,
            provinsi_objek,
            kabupaten_objek,
            kecamatan_objek,
            kelurahan_objek,
            kode_pos_objek,
            koordinat_objek: koordinat,
            tarif_pokok_objek: tarif,
            status_objek: 'Aktif'
        }, { transaction });
        console.timeEnd("DB_Insert_Objek");

        // 3. Persiapkan data dokumen
        const dokumenData = req.files?.map(file => ({
            id_objek: newObjek.id_objek,
            file_path: file.path,
        })) || [];

        if (dokumenData.length > 0) {
            console.time("DB_Bulk_Create_Dokumen");
            await DokumenObjek.bulkCreate(dokumenData, { transaction });
            console.timeEnd("DB_Bulk_Create_Dokumen");
        }

        await recordLog(req, {
            action: 'CREATE_DATA_OBJEK',
            module: 'MANAJEMEN_OBJEK',
            description: `Petugas menambahkan objek baru ${newObjek.npor_objek}`,
            oldData: null,
            newData: {
                nama_objek: newObjek.nama_objek,
                npor_objek: newObjek.npor_objek,
                kategori_objek: newObjek.kategori_objek
            }
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Objek retribusi berhasil ditambahkan',
            data: {
                newObjek,
                id_objek: newObjek.id_objek,
                jumlah_dokumen: dokumenData.length
            }
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error Detail:", error);
        res.status(500).json({ message: error.message });
    }
};

const generateNPOR = async () => {
    const year = new Date().getFullYear();

    const lastObjek = await Objek.findOne({
        order: [['createdAt', 'DESC']]
    });

    let lastNumber = 0;

    if (lastObjek && lastObjek.npor_objek) {
        const lastNPOR = lastObjek.npor_objek;
        const split = lastNPOR.split('-');
        lastNumber = parseInt(split[2]) || 0;
    }

    const nextNumber = (lastNumber + 1).toString().padStart(6, '0');

    return `NPOR-${year}-${nextNumber}`;
};

exports.getAllKelas = async (req, res) => {
    try {
        const dataKelas = await Kelas.findAll({
            attributes: [
                'id_kelas', 'tarif_kelas', 'nama_kelas', 'deskripsi_kelas', 'asumsi_volume_audit'
            ],
            include: [{
                model: RefPelayanan, as: 'pelayanan'
            }],
            order: [['id_kelas', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: 'Data kelas berhasil diambil',
            data: dataKelas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kelas',
            error: error.message
        });
    }
};

exports.getListObjek = async (req, res) => {
    try {
        // 1. Ambil query parameter untuk pagination & search
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // 2. Eksekusi findAndCountAll
        const { count, rows } = await Objek.findAndCountAll({
            where: {
                [Op.or]: [
                    {
                        nama_objek: {
                            [Op.iLike]: `%${search}%`
                        }
                    },
                    {
                        npor_objek: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                ]
            },
            attributes: {
                include: [
                    [sequelize.fn('ST_Y', sequelize.col('koordinat_objek')), 'lat'],
                    [sequelize.fn('ST_X', sequelize.col('koordinat_objek')), 'lng'],
                ]
            },
            include: [
                {
                    model: Kelas, as: 'kelas',
                    attributes: ['nama_kelas']
                },
                {
                    model: Subjek,
                    attributes: ['id_subjek', 'nama_subjek']
                },
                {
                    model: DokumenObjek,
                    attributes: ['id_dokumen_objek', 'file_path']
                },
                {
                    model: Skrd,
                    attributes: [
                        'id_skrd',
                        'no_skrd',
                        'total_bayar',
                        'periode_bulan',
                        'periode_tahun',
                        'createdAt',
                        'status'
                    ],
                },
                {
                    model: PoinObjek,
                    attributes: ['saldo_poin']
                },
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
            message: 'Daftar objek berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getListObjek:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
};

exports.updateObjek = async (req, res) => {
    const {
        id_objek,
        nama_objek,
        alamat_objek,
        kecamatan_objek,
        kelurahan_objek
    } = req.body;

    const transaction = await sequelize.transaction();
    try {
        const objek = await Objek.findByPk(id_objek, { transaction });

        if (!objek) {
            return res.status(404).json({
                success: false,
                message: 'Objek tidak ditemukan'
            });
        }

        // Update hanya field yang dikirim
        await objek.update({
            nama_objek: nama_objek ?? objek.nama_objek,
            alamat_objek: alamat_objek ?? objek.alamat_objek,
            kecamatan_objek: kecamatan_objek ?? objek.kecamatan_objek,
            kelurahan_objek: kelurahan_objek ?? objek.kelurahan_objek
        }, { transaction });

        await recordLog(req, {
            action: 'UPDATE_DATA_OBJEK',
            module: 'MANAJEMEN_OBJEK',
            description: `Petugas mengubah alamat objek dari ${objek.alamat_objek} menjadi ${alamat_objek}`,
            oldData: objek,
            newData: {
                nama_objek: objek.nama_objek,
                npor_objek: objek.npor_objek,
                kategori_objek: objek.kategori_objek
            }
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Objek berhasil diperbarui',
            data: objek
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
};

exports.nonaktifkanObjek = async (req, res) => {
    try {
        const { id_objek } = req.body;

        const objek = await Objek.findByPk(id_objek);

        if (!objek) {
            return res.status(404).json({
                success: false,
                message: 'Objek tidak ditemukan'
            });
        }

        const statusBaru =
            objek.status_objek === "Aktif"
                ? "Non-Aktif"
                : "Aktif";

        await objek.update({
            status_objek: statusBaru
        });

        await recordLog(req, {
            action: 'UPDATE_DATA_OBJEK',
            module: 'MANAJEMEN_OBJEK',
            description: `Petugas mengubah aktivasi objek`,
            oldData: objek,
            newData: statusBaru
        });

        return res.status(200).json({
            success: true,
            message: `Objek berhasil diubah menjadi ${statusBaru}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
};

exports.submitAuditObjek = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            id_objek,
            id_kelas_temuan,
            catatan_audit,
            nama_objek, alamat_objek, rt_rw, kecamatan_objek, kelurahan_objek, latitude, longitude,
            tarif_audit,
            durasi_audit,
            volume_audit,
            total_terbayar,
            total_wajib_bayar
        } = req.body;

        const objek = await Objek.findByPk(id_objek);
        if (!objek) return res.status(404).json({ message: "Objek tidak ditemukan" });

        // FIX: Ambil data kelas untuk menentukan kategori_objek
        const kelasBaru = await Kelas.findByPk(id_kelas_temuan);
        if (!kelasBaru) return res.status(400).json({ message: "Klasifikasi kelas tidak valid" });

        // Logika penentuan kategori berdasarkan deskripsi kelas
        const isNonRumah = kelasBaru.deskripsi_kelas.includes("Non Rumah Tinggal") || !kelasBaru.deskripsi_kelas.includes("Rumah Tinggal");

        await objek.update({
            nama_objek,
            alamat_objek,
            rt_rw_objek: rt_rw,
            kecamatan_objek,
            kelurahan_objek,
            id_kelas: id_kelas_temuan,
            tarif_pokok_objek: tarif_audit,
            kategori_objek: isNonRumah ? 'Non Rumah Tinggal' : 'Rumah Tinggal',
            koordinat_objek: sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`, 4326)
        }, { transaction });

        const tarif = parseFloat(tarif_audit) || 0;
        const terbayar = parseFloat(total_terbayar) || 0;
        const volume = parseFloat(volume_audit) || 0;
        const durasi = parseFloat(durasi_audit) || 0;

        // --- LOGIKA PERHITUNGAN ---
        let totalSeharusnya = 0;
        if (isNonRumah) {
            const masaBulan = durasi > 0 ? durasi : 1;
            totalSeharusnya = (tarif * volume) * masaBulan;
        } else {
            totalSeharusnya = tarif * durasi;
        }

        const selisihInputFE = parseFloat(total_wajib_bayar) || 0;
        const pokokKurangBayar = selisihInputFE > 0 ? selisihInputFE : Math.max(0, totalSeharusnya - terbayar);

        if (pokokKurangBayar > 0) {
            const nilaiDenda = pokokKurangBayar * 0.5;
            const grandTotalBayar = pokokKurangBayar + nilaiDenda;

            const now = new Date();
            const dueDate = new Date();
            dueDate.setDate(now.getDate() + 30);

            await Skrd.create({
                id_objek: objek.id_objek,
                no_skrd: `SKRDKB-AUDIT-${Date.now()}`,
                periode_bulan: now.getMonth() + 1,
                periode_tahun: now.getFullYear(),
                masa: isNonRumah ? 1 : durasi,
                jatuh_tempo: dueDate,
                tipe_skrd: 'Kurang Bayar',
                total_bayar: grandTotalBayar,
                denda: nilaiDenda,
                status: 'unpaid',
                keterangan: catatan_audit
            }, { transaction });
        }

        // Simpan Log
        await recordLog(req, {
            action: 'MANUAL_AUDIT_FINANSIAL',
            module: 'PEMERIKSAAN',
            description: `Audit NPOR ${objek.npor_objek}. Kategori: ${isNonRumah ? 'Bisnis' : 'Rumah'}. Pokok: ${pokokKurangBayar}, Denda: ${pokokKurangBayar * 0.5}`,
            oldData: null,
            newData: { ...req.body, total_akhir: pokokKurangBayar * 1.5 }
        }, { transaction });

        await transaction.commit();
        res.json({ success: true, message: "Hasil audit berhasil disimpan dan ditagihkan." });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getObjekBySubjekLogin = async (req, res) => {
    try {
        const id_subjek = req.user.id_subjek;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Objek.findAndCountAll({
            where: {
                id_subjek: id_subjek
            },
            attributes: {
                include: [
                    [sequelize.fn('ST_Y', sequelize.col('koordinat_objek')), 'lat'],
                    [sequelize.fn('ST_X', sequelize.col('koordinat_objek')), 'lng'],
                ]
            },
            include: [
                {
                    model: Kelas,
                    as: 'kelas',
                    attributes: ['nama_kelas']
                },
                {
                    model: Skrd,
                    attributes: [
                        'id_skrd',
                        'no_skrd',
                        'total_bayar',
                        'status'
                    ]
                },
                {
                    model: PoinObjek,
                    attributes: ['saldo_poin']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        res.status(200).json({
            status: 'success',
            message: 'Data objek milik subjek berhasil diambil',
            data: rows,
            pagination: {
                total_items: count,
                total_pages: Math.ceil(count / limit),
                current_page: page
            }
        });

    } catch (error) {
        console.error("Error getObjekBySubjekLogin:", error);
        res.status(500).json({
            message: 'Gagal mengambil data objek',
            error: error.message
        });
    }
};