const { Ssrd, Skrd, Objek, Subjek, Kelas, FormSurat } = require('../models');
const renderSsrdHtml = require('../templates/ssrdTemplate');

async function getSsrdHtml(id_ssrd) {
    const ssrd = await Ssrd.findByPk(id_ssrd, {
        include: [
            {
                model: Skrd,
                include: [
                    {
                        model: Objek,
                        include: [
                            { model: Subjek },
                            { model: Kelas, as: 'kelas' }
                        ]
                    }
                ]
            }
        ]
    });

    if (!ssrd) {
        throw new Error('SSRD tidak ditemukan');
    }

    const template = await FormSurat.findOne();

    // Pastikan mengirim skrd dari properti ssrd.Skrd
    return renderSsrdHtml({
        ssrd,
        skrd: ssrd.Skrd,
        template
    });
}

module.exports = {
    getSsrdHtml
};