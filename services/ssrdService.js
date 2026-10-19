const { Ssrd, Skrd, Objek, Subjek, Kelas, FormSurat } = require('../models');
const renderSsrdHtml = require('../templates/ssrdTemplate');
const { snap, extractMidtransPaymentDetails } = require('../utils/midtrans');

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

    // Auto-sync channel spesifik dari Midtrans jika sebelumnya hanya tersimpan generic 'midtrans'
    if (ssrd.midtrans_order_id && (ssrd.payment_method === 'midtrans' || !ssrd.midtrans_transaction_id)) {
        try {
            const statusResponse = await snap.transaction.status(ssrd.midtrans_order_id);
            if (statusResponse && (statusResponse.transaction_status === 'settlement' || statusResponse.transaction_status === 'capture')) {
                const details = extractMidtransPaymentDetails(statusResponse);
                await ssrd.update({
                    payment_method: details.channel,
                    midtrans_transaction_id: details.transaction_id || ssrd.midtrans_transaction_id,
                    va_number: details.va_number || ssrd.va_number
                });
                ssrd.payment_method = details.channel;
                if (details.transaction_id) ssrd.midtrans_transaction_id = details.transaction_id;
                if (details.va_number) ssrd.va_number = details.va_number;
            }
        } catch (e) {
            // Silently ignore jika order_id tidak ditemukan atau sandbox connection issue
        }
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