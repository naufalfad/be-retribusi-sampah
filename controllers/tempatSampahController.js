require('dotenv').config();
const { Op } = require('sequelize');
const { TempatSampah, sequelize } = require('../models');
const recordLog = require('../utils/logger');

// Helper normalisasi list foto (maksimal 4 foto)
const parseFotoList = (foto, foto_url) => {
    let list = [];
    if (Array.isArray(foto)) {
        list = foto;
    } else if (typeof foto === 'string' && foto.trim() !== '') {
        try {
            const parsed = JSON.parse(foto);
            if (Array.isArray(parsed)) list = parsed;
            else list = [foto.trim()];
        } catch {
            list = [foto.trim()];
        }
    }
    if (list.length === 0 && foto_url) {
        if (typeof foto_url === 'string' && foto_url.trim() !== '') {
            try {
                const parsed = JSON.parse(foto_url);
                if (Array.isArray(parsed)) list = parsed;
                else list = [foto_url.trim()];
            } catch {
                list = [foto_url.trim()];
            }
        } else if (Array.isArray(foto_url)) {
            list = foto_url;
        }
    }
    return list.filter(Boolean).slice(0, 4);
};

// 1. GET ALL TEMPAT SAMPAH (DENGAN FILTER & SEARCH)
exports.getAllTempatSampah = async (req, res) => {
    try {
        const { kategori, kecamatan, status, search } = req.query;
        const whereClause = {};

        if (kategori && kategori !== 'ALL') {
            whereClause.kategori = kategori;
        }

        if (kecamatan && kecamatan !== 'ALL') {
            whereClause.kecamatan = {
                [Op.iLike]: `%${kecamatan}%`
            };
        }

        if (status && status !== 'ALL') {
            whereClause.status_operasional = normalizeStatusOperasional(status);
        }

        if (search && search.trim() !== '') {
            const query = `%${search.trim()}%`;
            whereClause[Op.or] = [
                { nama_tempat: { [Op.iLike]: query } },
                { alamat: { [Op.iLike]: query } },
                { pengelola: { [Op.iLike]: query } },
                { kecamatan: { [Op.iLike]: query } },
                { kelurahan_desa: { [Op.iLike]: query } }
            ];
        }

        const data = await TempatSampah.findAll({
            where: whereClause,
            order: [['kategori', 'ASC'], ['nama_tempat', 'ASC']]
        });

        const formatted = data.map(item => {
            const raw = item.toJSON();
            const total = parseFloat(raw.kapasitas_total) || 0;
            const current = parseFloat(raw.volume_saat_ini) || 0;
            const persentase = total > 0 ? Math.min(100, (current / total) * 100).toFixed(1) : '0.0';

            // Pastikan lat & lng tersedia dalam format numerik
            const lat = parseFloat(raw.latitude);
            const lng = parseFloat(raw.longitude);
            const fotoList = parseFotoList(raw.foto, raw.foto_url);

            return {
                ...raw,
                lat,
                lng,
                persentase_keterisian: parseFloat(persentase),
                foto: fotoList,
                foto_url: fotoList[0] || null
            };
        });

        return res.status(200).json({
            success: true,
            total: formatted.length,
            data: formatted
        });
    } catch (error) {
        console.error('Error getAllTempatSampah:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat data tempat penampungan sampah.',
            error: error.message
        });
    }
};

// 2. GET STATISTIK RINGKASAN TEMPAT SAMPAH
exports.getTempatSampahStats = async (req, res) => {
    try {
        const allFacilities = await TempatSampah.findAll();

        const counts = {
            total: allFacilities.length,
            bank_sampah: 0,
            tps: 0,
            tpst: 0,
            tpa: 0,
            aktif: 0,
            penuh: 0,
            pemeliharaan: 0
        };

        allFacilities.forEach(f => {
            const kat = (f.kategori || '').toUpperCase();
            if (kat === 'BANK_SAMPAH') counts.bank_sampah++;
            else if (kat === 'TPS') counts.tps++;
            else if (kat === 'TPST') counts.tpst++;
            else if (kat === 'TPA') counts.tpa++;

            const st = (f.status_operasional || '').toLowerCase();
            if (st === 'aktif') counts.aktif++;
            else if (st === 'penuh') counts.penuh++;
            else if (st === 'pemeliharaan') counts.pemeliharaan++;
        });

        return res.status(200).json({
            success: true,
            data: counts
        });
    } catch (error) {
        console.error('Error getTempatSampahStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat statistik fasilitas sampah.',
            error: error.message
        });
    }
};

// 3. GET DETAIL BY ID
exports.getTempatSampahById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await TempatSampah.findByPk(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Data tempat penampungan sampah tidak ditemukan.'
            });
        }

        const raw = item.toJSON();
        const total = parseFloat(raw.kapasitas_total) || 0;
        const current = parseFloat(raw.volume_saat_ini) || 0;
        const persentase = total > 0 ? Math.min(100, (current / total) * 100).toFixed(1) : '0.0';
        const fotoList = parseFotoList(raw.foto, raw.foto_url);

        return res.status(200).json({
            success: true,
            data: {
                ...raw,
                lat: parseFloat(raw.latitude),
                lng: parseFloat(raw.longitude),
                persentase_keterisian: parseFloat(persentase),
                foto: fotoList,
                foto_url: fotoList[0] || null
            }
        });
    } catch (error) {
        console.error('Error getTempatSampahById:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail tempat penampungan sampah.',
            error: error.message
        });
    }
};

// Helper normalisasi status_operasional agar cocok dengan PostgreSQL ENUM ('Aktif', 'Penuh', 'Pemeliharaan', 'Non-Aktif')
const normalizeStatusOperasional = (status) => {
    if (!status) return 'Aktif';
    const s = String(status).trim().toLowerCase();
    if (s === 'aktif') return 'Aktif';
    if (s === 'penuh') return 'Penuh';
    if (s === 'pemeliharaan') return 'Pemeliharaan';
    if (s === 'non-aktif' || s === 'nonaktif' || s === 'non_aktif') return 'Non-Aktif';
    return 'Aktif';
};

// 4. CREATE TEMPAT SAMPAH BARU (ROLE: DLH / ADMIN)
exports.createTempatSampah = async (req, res) => {
    try {
        const {
            nama_tempat,
            kategori,
            alamat,
            kecamatan,
            kelurahan_desa,
            latitude,
            longitude,
            kapasitas_total,
            satuan_kapasitas,
            volume_saat_ini,
            status_operasional,
            jenis_sampah,
            jam_operasional,
            pengelola,
            kontak,
            keterangan,
            foto_url
        } = req.body;

        if (!nama_tempat || !kategori || !kecamatan || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Field nama tempat, kategori, kecamatan, dan koordinat (lat/lng) wajib diisi.'
            });
        }

        const latNum = parseFloat(latitude);
        const lngNum = parseFloat(longitude);

        if (isNaN(latNum) || isNaN(lngNum)) {
            return res.status(400).json({
                success: false,
                message: 'Koordinat latitude dan longitude harus berupa angka desimal yang valid.'
            });
        }

        // Pastikan jenis_sampah dalam format array
        let jenisSampahArray = [];
        if (Array.isArray(jenis_sampah)) {
            jenisSampahArray = jenis_sampah;
        } else if (typeof jenis_sampah === 'string') {
            try {
                jenisSampahArray = JSON.parse(jenis_sampah);
            } catch (e) {
                jenisSampahArray = jenis_sampah.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        const validStatus = normalizeStatusOperasional(status_operasional);

        // Kelola file foto yang diunggah atau list foto (Maksimal 4)
        let photoPaths = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            photoPaths = req.files.map(f => `/uploads/tempat-sampah/${f.filename}`);
        }
        if (req.body.foto) {
            let bodyFoto = req.body.foto;
            if (typeof bodyFoto === 'string') {
                try {
                    bodyFoto = JSON.parse(bodyFoto);
                } catch (e) {
                    bodyFoto = [bodyFoto];
                }
            }
            if (Array.isArray(bodyFoto)) {
                photoPaths = [...photoPaths, ...bodyFoto.filter(Boolean)];
            }
        }
        if (photoPaths.length === 0 && foto_url) {
            photoPaths = [foto_url];
        }
        photoPaths = photoPaths.slice(0, 4);

        const newFacility = await TempatSampah.create({
            nama_tempat: nama_tempat.trim(),
            kategori,
            alamat: alamat ? alamat.trim() : null,
            kecamatan: kecamatan.trim(),
            kelurahan_desa: kelurahan_desa ? kelurahan_desa.trim() : null,
            latitude: latNum,
            longitude: lngNum,
            koordinat: { type: 'Point', coordinates: [lngNum, latNum] },
            kapasitas_total: parseFloat(kapasitas_total) || 0,
            satuan_kapasitas: satuan_kapasitas || 'm3',
            volume_saat_ini: parseFloat(volume_saat_ini) || 0,
            status_operasional: validStatus,
            jenis_sampah: jenisSampahArray,
            jam_operasional: jam_operasional ? jam_operasional.trim() : null,
            pengelola: pengelola ? pengelola.trim() : null,
            kontak: kontak ? kontak.trim() : null,
            keterangan: keterangan ? keterangan.trim() : null,
            foto: photoPaths,
            foto_url: photoPaths[0] || null
        });

        // Catat Log Aktivitas
        await recordLog(req, {
            action: 'CREATE_TEMPAT_SAMPAH',
            module: 'TEMPAT_SAMPAH',
            description: `Menambahkan ${kategori}: ${nama_tempat} di Kec. ${kecamatan}`,
            newData: newFacility.toJSON()
        });

        const createdJson = newFacility.toJSON();
        const createdFoto = parseFotoList(createdJson.foto, createdJson.foto_url);

        return res.status(201).json({
            success: true,
            message: `Berhasil mendaftarkan fasilitas ${nama_tempat}.`,
            data: {
                ...createdJson,
                lat: parseFloat(createdJson.latitude),
                lng: parseFloat(createdJson.longitude),
                foto: createdFoto,
                foto_url: createdFoto[0] || null
            }
        });
    } catch (error) {
        console.error('Error createTempatSampah:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menambahkan fasilitas tempat penampungan sampah.',
            error: error.message
        });
    }
};

// 5. UPDATE TEMPAT SAMPAH
exports.updateTempatSampah = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await TempatSampah.findByPk(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Data tempat penampungan sampah tidak ditemukan.'
            });
        }

        const oldData = item.toJSON();

        const {
            nama_tempat,
            kategori,
            alamat,
            kecamatan,
            kelurahan_desa,
            latitude,
            longitude,
            kapasitas_total,
            satuan_kapasitas,
            volume_saat_ini,
            status_operasional,
            jenis_sampah,
            jam_operasional,
            pengelola,
            kontak,
            keterangan,
            foto_url
        } = req.body;

        const updatePayload = {};

        if (nama_tempat !== undefined) updatePayload.nama_tempat = nama_tempat.trim();
        if (kategori !== undefined) updatePayload.kategori = kategori;
        if (alamat !== undefined) updatePayload.alamat = alamat ? alamat.trim() : null;
        if (kecamatan !== undefined) updatePayload.kecamatan = kecamatan.trim();
        if (kelurahan_desa !== undefined) updatePayload.kelurahan_desa = kelurahan_desa ? kelurahan_desa.trim() : null;

        if (latitude !== undefined && longitude !== undefined) {
            const latNum = parseFloat(latitude);
            const lngNum = parseFloat(longitude);
            if (!isNaN(latNum) && !isNaN(lngNum)) {
                updatePayload.latitude = latNum;
                updatePayload.longitude = lngNum;
                updatePayload.koordinat = { type: 'Point', coordinates: [lngNum, latNum] };
            }
        }

        if (kapasitas_total !== undefined) updatePayload.kapasitas_total = parseFloat(kapasitas_total) || 0;
        if (satuan_kapasitas !== undefined) updatePayload.satuan_kapasitas = satuan_kapasitas;
        if (volume_saat_ini !== undefined) updatePayload.volume_saat_ini = parseFloat(volume_saat_ini) || 0;
        if (status_operasional !== undefined) updatePayload.status_operasional = normalizeStatusOperasional(status_operasional);

        if (jenis_sampah !== undefined) {
            if (Array.isArray(jenis_sampah)) {
                updatePayload.jenis_sampah = jenis_sampah;
            } else if (typeof jenis_sampah === 'string') {
                try {
                    updatePayload.jenis_sampah = JSON.parse(jenis_sampah);
                } catch (e) {
                    updatePayload.jenis_sampah = jenis_sampah.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
        }

        if (jam_operasional !== undefined) updatePayload.jam_operasional = jam_operasional;
        if (pengelola !== undefined) updatePayload.pengelola = pengelola;
        if (kontak !== undefined) updatePayload.kontak = kontak;
        if (keterangan !== undefined) updatePayload.keterangan = keterangan;

        // Kelola Foto (Maksimal 4)
        let hasPhotoUpdate = false;
        let existingPhotos = [];
        if (req.body.existing_foto !== undefined) {
            hasPhotoUpdate = true;
            let ef = req.body.existing_foto;
            if (typeof ef === 'string') {
                try { ef = JSON.parse(ef); } catch (e) { ef = [ef]; }
            }
            if (Array.isArray(ef)) existingPhotos = ef.filter(Boolean);
        } else if (req.body.foto !== undefined && (!req.files || req.files.length === 0)) {
            hasPhotoUpdate = true;
            let f = req.body.foto;
            if (typeof f === 'string') {
                try { f = JSON.parse(f); } catch (e) { f = [f]; }
            }
            if (Array.isArray(f)) existingPhotos = f.filter(Boolean);
        }

        let newUploadedPhotos = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            hasPhotoUpdate = true;
            newUploadedPhotos = req.files.map(f => `/uploads/tempat-sampah/${f.filename}`);
            if (req.body.existing_foto === undefined && req.body.foto === undefined) {
                existingPhotos = parseFotoList(item.foto, item.foto_url);
            }
        }

        if (hasPhotoUpdate) {
            const combined = [...existingPhotos, ...newUploadedPhotos].slice(0, 4);
            updatePayload.foto = combined;
            updatePayload.foto_url = combined[0] || null;
        } else if (foto_url !== undefined) {
            updatePayload.foto_url = foto_url;
            if (updatePayload.foto === undefined) {
                updatePayload.foto = foto_url ? [foto_url] : [];
            }
        }

        await item.update(updatePayload);

        // Catat Log Aktivitas
        await recordLog(req, {
            action: 'UPDATE_TEMPAT_SAMPAH',
            module: 'TEMPAT_SAMPAH',
            description: `Memperbarui data ${item.kategori}: ${item.nama_tempat}`,
            oldData,
            newData: item.toJSON()
        });

        const updatedJson = item.toJSON();
        const updatedFoto = parseFotoList(updatedJson.foto, updatedJson.foto_url);

        return res.status(200).json({
            success: true,
            message: `Fasilitas ${item.nama_tempat} berhasil diperbarui.`,
            data: {
                ...updatedJson,
                lat: parseFloat(updatedJson.latitude),
                lng: parseFloat(updatedJson.longitude),
                foto: updatedFoto,
                foto_url: updatedFoto[0] || null
            }
        });
    } catch (error) {
        console.error('Error updateTempatSampah:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data tempat penampungan sampah.',
            error: error.message
        });
    }
};

// 6. DELETE TEMPAT SAMPAH
exports.deleteTempatSampah = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await TempatSampah.findByPk(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Data tempat penampungan sampah tidak ditemukan.'
            });
        }

        const oldData = item.toJSON();
        await item.destroy();

        // Catat Log Aktivitas
        await recordLog(req, {
            action: 'DELETE_TEMPAT_SAMPAH',
            module: 'TEMPAT_SAMPAH',
            description: `Menghapus fasilitas ${oldData.kategori}: ${oldData.nama_tempat}`,
            oldData
        });

        return res.status(200).json({
            success: true,
            message: `Fasilitas ${oldData.nama_tempat} berhasil dihapus.`
        });
    } catch (error) {
        console.error('Error deleteTempatSampah:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal menghapus tempat penampungan sampah.',
            error: error.message
        });
    }
};
