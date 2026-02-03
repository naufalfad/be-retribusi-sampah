const { Skrd, Objek, Subjek, Kelas, FormSurat } = require('../models');
const renderSkrdHtml = require('../templates/skrdTemplate');

async function getSkrdHtml(id_skrd) {
    const skrd = await Skrd.findByPk(id_skrd, {
        include: [
            {
                model: Objek,
                include: [
                    { model: Subjek },
                    { model: Kelas, as: 'kelas' }
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