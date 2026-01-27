const { Objek, Kelas, Skrd, sequelize } = require('../models');

exports.penetapanSkrd = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_objek } = req.params;
        const {
            volume_sampah_objek,
            periode_bulan,
            periode_tahun,
            masa
        } = req.body;

        // 1. Cari data Objek dan sertakan data Kelas (Eager Loading)
        // Pastikan di model Objek sudah ada: this.belongsTo(models.Kelas, { foreignKey: 'id_kelas', as: 'kelas' })
        const objek = await Objek.findByPk(id_objek, {
            include: [{
                model: Kelas,
                as: 'kelas' // Pastikan alias ini sesuai dengan yang didefinisikan di models/objek.js
            }],
            transaction
        });

        if (!objek) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Data Objek tidak ditemukan' });
        }

        if (!objek.kelas) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Objek ditemukan tapi tidak terhubung ke Kelas. Pastikan id_kelas (${objek.id_kelas}) valid.`
            });
        }

        // 2. Parsing Data (Mencegah error kalkulasi NaN)
        const volume = parseFloat(volume_sampah_objek) || 0;
        const jumlahMasa = parseInt(masa) || 1;
        const denda = 0;

        // 3. Hitung tarif_pokok_objek
        // Rumus: tarif_kelas + (pelayanan1 * vol) + (pelayanan2 * vol) + (pelayanan3 * vol)
        const tarif_kelas = parseFloat(objek.kelas.tarif_kelas) || 0;
        const p1 = parseFloat(objek.kelas.tarif_pelayanan_1) || 0;
        const p2 = parseFloat(objek.kelas.tarif_pelayanan_2) || 0;
        const p3 = parseFloat(objek.kelas.tarif_pelayanan_3) || 0;

        const hitungTarifPokok = tarif_kelas + (p1 * volume) + (p2 * volume) + (p3 * volume);

        // 4. Update tabel Objek (Gunakan method update langsung)
        await objek.update({
            volume_sampah_objek: volume,
            tarif_pokok_objek: hitungTarifPokok // Pastikan nama kolom di DB persis seperti ini
        }, { transaction });

        // 5. Hitung total_bayar untuk tabel SKRD
        const total_bayar = (hitungTarifPokok * jumlahMasa) + denda;

        // 6. Generate Nomor SKRD
        const uniqueId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const no_skrd = `SKRD/${periode_tahun}/${periode_bulan}/${uniqueId}`;

        // 7. Hitung Jatuh Tempo (1 Bulan dari sekarang)
        const jatuh_tempo = new Date();
        jatuh_tempo.setMonth(jatuh_tempo.getMonth() + 1);

        // 8. Simpan ke tabel SKRD
        const newSkrd = await Skrd.create({
            id_objek: id_objek,
            no_skrd: no_skrd,
            periode_bulan: periode_bulan,
            periode_tahun: periode_tahun,
            masa: jumlahMasa,
            jatuh_tempo: jatuh_tempo,
            denda: denda === 0 ? null : denda,
            total_bayar: total_bayar,
        }, { transaction });

        // Commit semua perubahan
        await transaction.commit();

        res.status(201).json({
            message: 'Penetapan SKRD Berhasil',
            data_update_objek: {
                volume: volume,
                tarif_pokok_per_bulan: hitungTarifPokok
            },
            data_skrd: newSkrd
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Error Detail:", error);
        res.status(500).json({ message: error.message });
    }
};