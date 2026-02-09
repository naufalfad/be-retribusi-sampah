const { Subjek, FormSurat } = require('../models');
const renderNpwrdHtml = require('../templates/npwrdTemplate');

async function getNpwrdHtml(id_subjek, plainPassword) {
    const subjekData = await Subjek.findByPk(id_subjek, {
        attributes: [
            'kategori_subjek', 'nama_subjek', 'penanggung_jawab_subjek', 'npwp_subjek',
            'nik_subjek', 'alamat_subjek', 'password_subjek', 'npwrd_subjek', 'createdAt'
        ],
    });

    if (!subjekData) {
        throw new Error('Subjek tidak ditemukan');
    }

    const subjek = {
        ...subjekData.toJSON(),
        password_asli: plainPassword
    };

    const template = await FormSurat.findOne();

    return renderNpwrdHtml({ subjek, template });
}

module.exports = {
    getNpwrdHtml
};