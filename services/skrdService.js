const { Skrd, Objek, Subjek, Kelas, RefPelayananSkrd, FormSurat } = require('../models');
const renderSkrdHtml = require('../templates/skrdTemplate');

async function getSkrdHtml(id_skrd) {
    const skrd = await Skrd.findByPk(id_skrd, {
        include: [
            {
                model: Objek,
                include: [
                    { model: Subjek },
                    { model: Kelas, as: 'kelas', }
                ]
            },
            {
                model: RefPelayananSkrd,
                as: 'pelayanan',
                attributes: [
                    'nama_pelayanan',
                    'tarif_pelayanan',
                    'volume',
                    'sub_total'
                ]
            }
        ]
    });

    if (!skrd) {
        throw new Error('SKRD tidak ditemukan');
    }

    const template = await FormSurat.findOne();

    return renderSkrdHtml({ skrd, template });
}

module.exports = {
    getSkrdHtml
};