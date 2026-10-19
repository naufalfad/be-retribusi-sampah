require('dotenv').config();
const { Subjek, Objek, sequelize, DokumenSubjek } = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');
const { Op } = require('sequelize');
const { getNpwrdHtml } = require('../services/npwrdService');
const { getBrowser } = require('../utils/puppeteerBrowser');
const { generateRandomPassword } = require('../utils/passwordGenerator');
const recordLog = require('../utils/logger');

exports.createSubjek = async (req, res) => {
    if (!req.user || !req.user.id_staff) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Hanya petugas yang dapat mendaftarkan NPWRD.'
        });
    }

    const transaction = await sequelize.transaction();
    try {
        const {
            kategori_subjek, nama_subjek, penanggung_jawab_subjek, npwp_subjek, nik_subjek,
            telepon_subjek, email_subjek, alamat_subjek, rt_rw_subjek, provinsi_subjek,
            kabupaten_subjek, kecamatan_subjek, kelurahan_subjek, kode_pos_subjek,
            password_subjek
        } = req.body;

        const idStaffLogin = req.user.id_staff;
        const hashedPassword = await bcrypt.hash(password_subjek, 10);
        const npwrdGenerated = await generateNPWRD(nik_subjek);
        const newSubjek = await Subjek.create({
            id_staff: idStaffLogin,
            kategori_subjek,
            nama_subjek,
            penanggung_jawab_subjek: penanggung_jawab_subjek || null,
            npwp_subjek: npwp_subjek || null,
            nik_subjek,
            telepon_subjek,
            email_subjek,
            alamat_subjek,
            rt_rw_subjek,
            provinsi_subjek,
            kabupaten_subjek,
            kecamatan_subjek,
            kelurahan_subjek,
            kode_pos_subjek,
            password_subjek: hashedPassword,
            npwrd_subjek: npwrdGenerated,
            status_subjek: 'Aktif'
        }, { transaction });

        const dokumenData = req.files?.map(file => ({
            id_subjek: newSubjek.id_subjek,
            file_path: file.path,
        })) || [];

        if (dokumenData.length > 0) {
            await DokumenSubjek.bulkCreate(dokumenData, { transaction });
        }

        await recordLog(req, {
            action: 'CREATE_DATA_SUBJEK',
            module: 'MANAJEMEN_SUBJEK',
            description: `Petugas menambahkan subjek baru ${newSubjek.npwrd_subjek}`,
            oldData: null,
            newData: {
                nama_subjek: newSubjek.nama_subjek,
                npwp_subjek: newSubjek.npwp_subjek,
                kategori_subjek: newSubjek.kategori_subjek
            }
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'NPWRD berhasil dibuat',
            data: {
                newSubjek,
                npwrd: newSubjek.npwrd_subjek,
                nama: newSubjek.nama_subjek,
                jumlah_dokumen: dokumenData.length
            }
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const generateNPWRD = async (nik_subjek) => {
    const year = new Date().getFullYear().toString();
    const nikDigits = (nik_subjek || '').toString().replace(/\D/g, '');
    const nikSuffix = nikDigits.length >= 2 ? nikDigits.slice(-2) : nikDigits.padStart(2, '0');

    // Ambil subjek terakhir untuk menentukan urutan berikutnya
    const lastSubjek = await Subjek.findOne({
        order: [['id_subjek', 'DESC']]
    });

    let lastNumber = 0;

    if (lastSubjek && lastSubjek.npwrd_subjek) {
        const lastNPWRD = lastSubjek.npwrd_subjek.toString().trim();

        // 1. Cek format baru seragam: [2 digit NIK][4 digit Tahun][3 atau 4 digit Nomor Urut]
        const matchDigits = lastNPWRD.match(/^\d{2}\d{4}(\d{3,4})$/);
        if (matchDigits) {
            lastNumber = parseInt(matchDigits[1], 10) || 0;
        } else {
            // 2. Cek format lama berpemisah (NPWRD-YYYY-XXXXXX atau 1.2203.2201)
            const matchSeparated = lastNPWRD.match(/[-.](\d{3,4})$/);
            if (matchSeparated) {
                lastNumber = parseInt(matchSeparated[1], 10) || 0;
            } else {
                // 3. Fallback: ambil maksimal 4 digit terakhir saja agar tidak menelan prefix tahun/NIK
                const last4Digits = lastNPWRD.slice(-4).replace(/\D/g, '');
                if (last4Digits) {
                    lastNumber = parseInt(last4Digits, 10) || 0;
                }
            }
        }
    }

    let nextNumber = lastNumber + 1;
    // Format seragam 10 digit: [2 digit NIK][4 digit Tahun][4 digit Nomor Urut]
    let candidate = `${nikSuffix}${year}${nextNumber.toString().padStart(4, '0')}`;

    // Pastikan nomor kandidat belum pernah digunakan (mencegah duplikasi)
    let exists = await Subjek.findOne({ where: { npwrd_subjek: candidate } });
    while (exists) {
        nextNumber++;
        candidate = `${nikSuffix}${year}${nextNumber.toString().padStart(4, '0')}`;
        exists = await Subjek.findOne({ where: { npwrd_subjek: candidate } });
    }

    return candidate;
};

exports.getDokumenSubjek = async (req, res) => {
    try {
        const { id_subjek } = req.params;
        const subjekData = await Subjek.findByPk(id_subjek)

        if (!subjekData || !subjekData.dokumen_subjek) {
            return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
        }

        res.sendFile(path.resolve(subjekData.dokumen_subjek));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

exports.getListSubjek = async (req, res) => {
    try {
        // 1. Ambil query parameter untuk pagination & search
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // 2. Eksekusi findAndCountAll
        const { count, rows } = await Subjek.findAndCountAll({
            where: {
                // Contoh filter pencarian berdasarkan nama_subjek
                nama_subjek: {
                    [Op.iLike]: `%${search}%` // Gunakan Op.like jika menggunakan MySQL
                }
            },
            include: [{ model: Objek }], // Aktifkan jika ingin menarik data objek terkait
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
            message: 'Daftar subjek berhasil diambil',
            pagination: {
                total_items: count,
                total_pages: totalPages,
                current_page: page,
                items_per_page: limit
            },
            data: rows
        });

    } catch (error) {
        console.error("Error getListSubjek:", error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data subjek',
            error: error.message
        });
    }
};

exports.previewNpwrdHtml = async (req, res) => {
    try {
        const html = await getNpwrdHtml(req.params.id_subjek);
        res.type('html').send(html);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.cetakNpwrdPdf = async (req, res) => {
    try {
        const { id_subjek } = req.params;

        const newPlainPassword = generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPlainPassword, salt);

        await Subjek.update(
            { password_subjek: hashedPassword },
            { where: { id_subjek } }
        );

        const html = await getNpwrdHtml(id_subjek, newPlainPassword);

        const browser = await getBrowser();
        const page = await browser.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                width: '85.6mm',
                height: '53.98mm',
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 }
            });

            res.type('pdf').send(pdf);
        } finally {
            await page.close();
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.ubahPasswordSubjek = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const idSubjek = req.user.id_subjek;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Password lama dan baru wajib diisi" });
        }

        // 1. Cari data Wajib Retribusi
        const user = await Subjek.findByPk(idSubjek);
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan" });

        // 2. Verifikasi Password Lama
        const isMatch = await bcrypt.compare(oldPassword, user.password_subjek);
        if (!isMatch) {
            return res.status(401).json({ message: "Kata sandi lama salah" });
        }

        // 3. Hash Password Baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update ke Database
        await user.update({ password_subjek: hashedPassword });

        // 5. Catat ke Audit Log
        await recordLog(req, {
            action: 'CHANGE_PASSWORD_SELF',
            module: 'WAJIB_RETRIBUSI',
            description: `Wajib Retribusi ${user.nama_subjek} memperbarui kata sandi secara mandiri`,
            oldData: null,
            newData: null
        });

        res.json({ success: true, message: "Kata sandi berhasil diperbarui" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal memproses permintaan", error: error.message });
    }
};

exports.getSubjekById = async (req, res) => {
    try {
        let id_subjek = req.params.id_subjek;
        if (!id_subjek || id_subjek === 'me' || id_subjek === 'self' || id_subjek === 'undefined') {
            id_subjek = req.user?.id_subjek;
        }

        if (!id_subjek || isNaN(Number(id_subjek))) {
            return res.status(400).json({ success: false, message: 'ID Subjek tidak valid' });
        }

        const subjekData = await Subjek.findByPk(id_subjek, {
            attributes: ['id_subjek', 'nama_subjek', 'npwrd_subjek', 'nik_subjek', 'alamat_subjek', 'telepon_subjek', 'status_subjek']
        });

        if (!subjekData) {
            return res.status(404).json({ success: false, message: 'Data Subjek tidak ditemukan' });
        }

        res.status(200).json({
            success: true,
            data: subjekData
        });
    } catch (error) {
        console.error("Error getSubjekById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};