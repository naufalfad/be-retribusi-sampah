const fs = require('fs');
const { sequelize, FormSurat } = require('../models');
const path = require('path');

exports.inputTemplate = async (req, res) => {
    const {
        nama_pemda,
        dinas_pelaksana,
        alamat_pemda,
        nama_pejabat,
        nip_pejabat,
        jabatan_pejabat,
        format_skrd,
        format_ssrd
    } = req.body;

    if (!req.files?.logo) {
        return res.status(400).json({
            message: 'Logo wajib diupload'
        });
    }

    const logoPath = req.files.logo[0].path;
    const ttdPath = req.files?.ttd_pejabat
        ? req.files.ttd_pejabat[0].path
        : null;

    const transaction = await sequelize.transaction();

    try {
        const newTemplate = await FormSurat.create({
            nama_pemda,
            dinas_pelaksana,
            alamat_pemda,
            nama_pejabat,
            nip_pejabat,
            jabatan_pejabat,
            format_skrd,
            format_ssrd,
            logo: logoPath,
            ttd_pejabat: ttdPath
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Template berhasil ditambahkan',
            data: newTemplate
        });

    } catch (error) {
        if (transaction) await transaction.rollback();

        if (logoPath && fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        if (ttdPath && fs.existsSync(ttdPath)) fs.unlinkSync(ttdPath);

        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateTemplate = async (req, res) => {

    const { id_template } = req.params;

    const {
        nama_pemda,
        dinas_pelaksana,
        alamat_pemda,
        nama_pejabat,
        nip_pejabat,
        jabatan_pejabat,
        format_skrd,
        format_ssrd
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const template = await FormSurat.findByPk(id_template, { transaction });

        if (!template) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Template tidak ditemukan' });
        }

        // simpan path lama untuk rollback file
        const oldLogo = template.logo;
        const oldTTD = template.ttd_pejabat;

        let logoPath = oldLogo;
        let ttdPath = oldTTD;

        if (req.files?.logo) {
            logoPath = req.files.logo[0].path;
        }

        if (req.files?.ttd_pejabat) {
            ttdPath = req.files.ttd_pejabat[0].path;
        }

        await template.update({
            nama_pemda: nama_pemda ?? template.nama_pemda,
            dinas_pelaksana: dinas_pelaksana ?? template.dinas_pelaksana,
            alamat_pemda: alamat_pemda ?? template.alamat_pemda,
            nama_pejabat: nama_pejabat ?? template.nama_pejabat,
            nip_pejabat: nip_pejabat ?? template.nip_pejabat,
            jabatan_pejabat: jabatan_pejabat ?? template.jabatan_pejabat,
            format_skrd: format_skrd ?? template.format_skrd,
            format_ssrd: format_ssrd ?? template.format_ssrd,
            logo: logoPath,
            ttd_pejabat: ttdPath
        }, { transaction });

        await transaction.commit();

        // hapus file lama SETELAH commit
        if (req.files?.logo && oldLogo && fs.existsSync(oldLogo)) {
            fs.unlinkSync(oldLogo);
        }

        if (req.files?.ttd_pejabat && oldTTD && fs.existsSync(oldTTD)) {
            fs.unlinkSync(oldTTD);
        }

        res.status(200).json({
            message: 'Template berhasil diperbarui',
            data: template
        });

    } catch (error) {
        if (transaction) await transaction.rollback();

        // hapus file BARU jika gagal
        if (req.files?.logo) fs.unlink(req.files.logo[0].path, () => { });
        if (req.files?.ttd_pejabat) fs.unlink(req.files.ttd_pejabat[0].path, () => { });

        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getForm = async (req, res) => {
    try {
        const dataKelas = await FormSurat.findAll({
            FormSurat
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