require('dotenv').config();
const { Objek, DokumenObjek, sequelize } = require('../models');

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
        // 2. Gunakan console.time untuk debug bagian mana yang lambat
        console.time("DB_Insert_Objek");
        const newObjek = await Objek.create({
            id_subjek,
            id_kelas: req.body.id_kelas,
            npor_objek: req.body.npor_objek,
            kategori_objek: req.body.kategori_objek,
            nama_objek: req.body.nama_objek,
            alamat_objek: req.body.alamat_objek,
            telepon_objek: req.body.telepon_objek,
            kabupaten_objek: req.body.kabupaten_objek,
            kecamatan_objek: req.body.kecamatan_objek,
            kelurahan_objek: req.body.kelurahan_objek,
            kode_pos_objek: req.body.kode_pos_objek,
            koordinat_objek: koordinat,
            tarif_pokok: null
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
                    attributes: ['id_dokumen', 'file_path']
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