require('dotenv').config();
const { Op } = require('sequelize');
const { RefProvinsi, RefKabupaten, RefKecamatan, RefKelurahan, RefKodepos, RefPelayanan,
    Objek, DokumenObjek, Kelas, Subjek, sequelize } = require('../models');
const { findOrCreateByName } = require('../utils/refHelper');

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
            tarif_pokok_objek: tarif
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

exports.getAllObjek = async (req, res) => {
    try {
        // Ambil parameter query untuk paginasi (opsional)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Objek.findAndCountAll({
            // Mengambil data dokumen terkait (Eager Loading)
            include: [
                {
                    model: DokumenObjek,
                    attributes: ['id_dokumen_objek', 'file_path']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            message: 'Data objek berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getAllObjek:", error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data',
            error: error.message
        });
    }
};

exports.getAllKelas = async (req, res) => {
    try {
        const dataKelas = await Kelas.findAll({
            attributes: [
                'id_kelas', 'tarif_kelas', 'nama_kelas', 'deskripsi_kelas'
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
                // Contoh filter pencarian berdasarkan nama_subjek
                nama_objek: {
                    [Op.iLike]: `%${search}%` // Gunakan Op.like jika menggunakan MySQL
                }
            },
            include: [
                {
                    model: Subjek,
                    attributes: ['id_subjek', 'nama_subjek']
                },
                {
                    model: DokumenObjek,
                    attributes: ['id_dokumen_objek', 'file_path']
                }],
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