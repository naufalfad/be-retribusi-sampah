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

// exports.submitAuditObjek01 = async (req, res) => {
//     const transaction = await sequelize.transaction();

//     try {
//         const {
//             id_objek,
//             id_kelas,
//             id_kelas_temuan,
//             nama_objek,
//             alamat_objek,
//             rt_rw,
//             kecamatan_objek,
//             kelurahan_objek,
//             latitude,
//             longitude,
//             tgl_mulai_pelanggaran,
//             catatan_audit
//         } = req.body;

//         const idStaffLogin = req.user.id_staff;

//         // 1. Cari data objek yang akan diaudit
//         const objek = await Objek.findByPk(id_objek);
//         if (!objek) {
//             return res.status(404).json({ success: false, message: 'Objek tidak ditemukan.' });
//         }

//         // 2. Cari data kelas retribusi yang baru (untuk mengambil tarif terbaru)
//         const kelasLama = await Kelas.findByPk(id_kelas);
//         const kelasBaru = await Kelas.findByPk(id_kelas_temuan, {
//             include: [{ model: RefPelayanan, as: 'pelayanan', }]
//         });
//         if (!kelasBaru) {
//             return res.status(400).json({ success: false, message: 'Klasifikasi retribusi tidak valid.' });
//         }

//         const start = new Date(tgl_mulai_pelanggaran);
//         const now = new Date();
//         const durasiBulan = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

//         const pelayananUtama = kelasBaru.pelayanan && kelasBaru.pelayanan.length > 0
//             ? kelasBaru.pelayanan[0]
//             : null;

//         const tarifPerM3 = pelayananUtama ? parseFloat(pelayananUtama.tarif_pelayanan) : 0;
//         const asumsiVolume = kelasBaru.asumsi_volume_audit || 10;

//         const isNonRumah = !kelasBaru.deskripsi_kelas.includes("Rumah Tinggal");
//         const seharusnyaBayar = isNonRumah
//             ? (asumsiVolume * tarifPerM3) * durasiBulan
//             : kelasBaru.tarif_kelas * durasiBulan;

//         const sudahDibayar = kelasLama.tarif_kelas * durasiBulan;
//         const selisihPokok = seharusnyaBayar - sudahDibayar;
//         const dendaSanksi = selisihPokok * 0.5;
//         const totalHukuman = selisihPokok + dendaSanksi;

//         // 3. Simpan data lama untuk keperluan Log Audit (Audit Trail)
//         const oldData = { ...objek.dataValues };

//         // 4. Update data Objek
//         await objek.update({
//             nama_objek: nama_objek,
//             alamat_objek: alamat_objek,
//             rt_rw_objek: rt_rw,
//             kecamatan_objek: kecamatan_objek,
//             kelurahan_objek: kelurahan_objek,
//             id_kelas: id_kelas_temuan,
//             // Otomatis update tarif pokok sesuai kelas temuan
//             tarif_pokok_objek: kelasBaru.tarif_kelas,
//             kategori_objek: kelasBaru.deskripsi_kelas.includes("Rumah Tinggal") ? "Rumah Tinggal" : "Non Rumah Tinggal",
//             // Handle tipe data Geometry (PostGIS)
//             koordinat_objek: sequelize.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`, 4326)
//         }, { transaction });

//         if (totalHukuman > 0) {
//             const today = new Date();
//             const currentMonth = today.getMonth() + 1;
//             const currentYear = today.getFullYear();

//             const dueDate = new Date();
//             dueDate.setDate(today.getDate() + 30);

//             await Skrd.create({
//                 id_objek: objek.id_objek,
//                 no_skrd: `SKRDKB-FRAUD-${Date.now()}`,
//                 periode_bulan: currentMonth,
//                 periode_tahun: currentYear,
//                 masa: durasiBulan,
//                 jatuh_tempo: dueDate,
//                 tipe_skrd: 'Kurang Bayar',
//                 total_bayar: totalHukuman,
//                 denda: dendaSanksi,
//                 status: 'unpaid',
//                 keterangan: catatan_audit
//             }, { transaction });
//         }

//         // 5. Catat ke Log Aktivitas (Sangat Penting untuk Audit)
//         await recordLog(req, {
//             action: 'AUDIT_SURVEY_LAPANGAN',
//             module: 'PEMERIKSAAN',
//             description: `Dinas melakukan audit lapangan pada NPOR ${objek.npor_objek}. Alasan: ${catatan_audit}`,
//             oldData: oldData,
//             newData: {
//                 ...objek.dataValues,
//                 catatan_pemeriksa: catatan_audit
//             }
//         }, { transaction });

//         // Commit semua perubahan
//         await transaction.commit();

//         res.status(200).json({
//             success: true,
//             message: `Audit NPOR ${objek.npor_objek} berhasil disimpan. Data objek dan tarif telah diperbarui.`,
//             data: objek
//         });

//     } catch (error) {
//         if (transaction) await transaction.rollback();
//         console.error("Error submitAuditObjek:", error);
//         res.status(500).json({
//             success: false,
//             message: 'Gagal memproses audit objek.',
//             error: error.message
//         });
//     }
// };

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