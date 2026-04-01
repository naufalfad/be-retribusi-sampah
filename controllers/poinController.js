const { Pengangkutan, PengangkutanDetail, LogAktivitas,
    PoinObjek, RefKategoriSampah, Objek, sequelize } = require('../models');
const { Op, fn, col, where } = require('sequelize');
const recordLog = require('../utils/logger');

// Get All Categories
exports.getAllCategories = async (req, res) => {
    try {
        const data = await RefKategoriSampah.findAll({
            order: [['id_kategori', 'ASC']]
        });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create New Category
exports.createCategory = async (req, res) => {
    try {
        const { nama_kategori, poin_per_m3, satuan } = req.body;

        const newCat = await RefKategoriSampah.create({
            nama_kategori,
            poin_per_m3,
            satuan: satuan || 'm³'
        });

        await recordLog(req, {
            action: 'CREATE_POIN_CATEGORY',
            module: 'PENGATURAN_POIN',
            description: `Admin menambah kategori sampah baru: ${nama_kategori} dengan tarif ${poin_per_m3} poin/${satuan}`,
            newData: newCat
        });

        res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan", data: newCat });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kategori, poin_per_m3, satuan, deskripsi } = req.body;

        const category = await RefKategoriSampah.findByPk(id);
        if (!category) return res.status(404).json({ message: "Kategori tidak ditemukan" });

        const oldData = { ...category.dataValues };

        await category.update({
            nama_kategori,
            poin_per_m3,
            satuan,
            deskripsi
        });

        await recordLog(req, {
            action: 'UPDATE_POIN_CATEGORY',
            module: 'PENGATURAN_POIN',
            description: `Admin mengubah tarif poin kategori: ${nama_kategori}`,
            oldData,
            newData: category
        });

        res.json({ success: true, message: "Kategori berhasil diperbarui", data: category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await RefKategoriSampah.findByPk(id);

        if (!category) return res.status(404).json({ message: "Data tidak ditemukan" });

        await recordLog(req, {
            action: 'DELETE_POIN_CATEGORY',
            module: 'PENGATURAN_POIN',
            description: `Admin menghapus kategori poin: ${category.nama_kategori}`,
            oldData: category
        });

        await category.destroy();
        res.json({ success: true, message: "Kategori berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPengangkutan = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id_objek, details } = req.body;
        const id_petugas = req.user.id_petugas;

        if (!id_objek || !details || details.length === 0) {
            return res.status(400).json({ message: 'Data tidak lengkap' });
        }

        for (const d of details) {
            if (!d.id_kategori || !d.volume || d.volume <= 0) {
                return res.status(400).json({ message: 'Detail tidak valid' });
            }
        }

        const now = new Date();

        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        const existing = await Pengangkutan.findOne({
            where: {
                id_objek,
                tgl_pengangkutan: {
                    [Op.between]: [start, end]
                }
            },
            transaction: t
        });

        if (existing) {
            return res.status(400).json({
                message: "Objek ini sudah diangkut hari ini"
            });
        }

        let totalPoin = 0;
        const kategoriMap = {};

        // 🔥 HITUNG TOTAL
        for (const item of details) {
            if (!kategoriMap[item.id_kategori]) {
                kategoriMap[item.id_kategori] = await RefKategoriSampah.findByPk(item.id_kategori);
            }

            const kategori = kategoriMap[item.id_kategori];
            if (!kategori) continue;

            const poin = Number(item.volume) * Number(kategori.poin_per_m3);
            totalPoin += poin;
        }

        // 1. SIMPAN PENGANGKUTAN
        const pengangkutan = await Pengangkutan.create({
            id_objek,
            id_petugas,
            tgl_pengangkutan: new Date(),
            total_poin_transaksi: totalPoin
        }, { transaction: t });

        // 2. SIMPAN DETAIL
        for (const item of details) {
            const kategori = await RefKategoriSampah.findByPk(item.id_kategori);

            if (!kategori) continue;

            const poin = parseFloat(item.volume) * parseFloat(kategori.poin_per_m3);

            await PengangkutanDetail.create({
                id_pengangkutan: pengangkutan.id_pengangkutan,
                id_kategori: item.id_kategori,
                volume: item.volume,
                subtotal_poin_transaksi: poin
            }, { transaction: t });
        }

        // 3. UPDATE / CREATE POIN OBJEK
        let poinObjek = await PoinObjek.findOne({
            where: { id_objek },
            transaction: t
        });

        if (!poinObjek) {
            poinObjek = await PoinObjek.create({
                id_objek,
                saldo_poin: totalPoin,
                total_poin_didapat: totalPoin,
                total_poin_digunakan: 0
            }, { transaction: t });
        } else {
            await poinObjek.update({
                saldo_poin: poinObjek.saldo_poin + totalPoin,
                total_poin_didapat: poinObjek.total_poin_didapat + totalPoin
            }, { transaction: t });
        }

        await recordLog(req, {
            action: 'COLLECT_POIN',
            module: 'INPUT_PENGANGKUTAN',
            description: `Pengangkutan sampah dengan id objek: ${id_objek}, total poin: ${totalPoin}`,
            oldData: null,
            newData: null
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Pengangkutan berhasil disimpan',
            total_poin: totalPoin
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.monitoringPengangkutan = async (req, res) => {
    try {
        const kelurahan_objek = req.user.kelurahan;

        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        const objek = await Objek.findAll({
            where: { kelurahan_objek },
            include: [
                {
                    model: Pengangkutan,
                    required: false,
                    where: {
                        tgl_pengangkutan: {
                            [Op.between]: [start, end]
                        }
                    }
                }
            ]
        });

        const result = objek.map(obj => ({
            id_objek: obj.id_objek,
            nama_objek: obj.nama_objek,
            alamat: obj.alamat_objek,
            kategori: obj.kategori_objek,
            status: obj.Pengangkutans.length > 0 ? 'SUDAH' : 'BELUM'
        }));

        res.json({ success: true, data: result });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};