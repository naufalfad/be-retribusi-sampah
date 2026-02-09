require('dotenv').config();
const { Subjek, Objek, sequelize, DokumenSubjek } = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');
const { Op } = require('sequelize');
const { getNpwrdHtml } = require('../services/npwrdService');
const { getBrowser } = require('../utils/puppeteerBrowser');
const { generateRandomPassword } = require('../utils/passwordGenerator');

exports.createSubjek = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            kategori_subjek, nama_subjek, penanggung_jawab_subjek, npwp_subjek, nik_subjek,
            telepon_subjek, email_subjek, alamat_subjek, rt_rw_subjek, provinsi_subjek,
            kabupaten_subjek, kecamatan_subjek, kelurahan_subjek, kode_pos_subjek,
            password_subjek
        } = req.body;
        const idStaffLogin = req.auth.id_staff;
        const hashedPassword = await bcrypt.hash(password_subjek, 10);
        const npwrdGenerated = await generateNPWRD();
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

const generateNPWRD = async () => {
    const year = new Date().getFullYear();

    const lastSubjek = await Subjek.findOne({
        order: [['createdAt', 'DESC']]
    });

    let lastNumber = 0;

    if (lastSubjek && lastSubjek.npwrd_subjek) {
        const lastNPWRD = lastSubjek.npwrd_subjek;
        const split = lastNPWRD.split('-');
        lastNumber = parseInt(split[2]) || 0;
    }

    const nextNumber = (lastNumber + 1).toString().padStart(6, '0');

    return `NPWRD-${year}-${nextNumber}`;
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