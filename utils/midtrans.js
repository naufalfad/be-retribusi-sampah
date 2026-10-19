require('dotenv').config();
const midtransClient = require('midtrans-client');

const snap = new midtransClient.Snap({
    isProduction: false, // Set ke true jika sudah live
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

/**
 * Ekstrak nama channel pembayaran spesifik sesuai riwayat transaksi Midtrans
 * Contoh hasil:
 * - "BCA Virtual Account"
 * - "BNI Virtual Account"
 * - "BRI Virtual Account"
 * - "Mandiri Bill Payment"
 * - "Permata Virtual Account"
 * - "QRIS" / "QRIS (GOPAY)"
 * - "GoPay"
 * - "ShopeePay"
 * - "Indomaret" / "Alfamart"
 * - "Kartu Kredit / Debit"
 */
function extractMidtransPaymentDetails(midtransData) {
    if (!midtransData) {
        return {
            channel: 'Online (Midtrans)',
            transaction_id: null,
            va_number: null,
            settlement_time: null
        };
    }

    const {
        payment_type,
        va_numbers,
        permata_va_number,
        transaction_id,
        issuer,
        acquirer,
        store,
        bank,
        settlement_time,
        transaction_time
    } = midtransData;

    let channel = 'Online (Midtrans)';

    if (payment_type === 'bank_transfer') {
        if (Array.isArray(va_numbers) && va_numbers.length > 0 && va_numbers[0].bank) {
            channel = `${va_numbers[0].bank.toUpperCase()} Virtual Account`;
        } else if (permata_va_number) {
            channel = 'Permata Virtual Account';
        } else if (bank) {
            channel = `${bank.toUpperCase()} Virtual Account`;
        } else {
            channel = 'Transfer Bank (VA)';
        }
    } else if (payment_type === 'echannel') {
        channel = 'Mandiri Bill Payment';
    } else if (payment_type === 'qris') {
        if (acquirer || issuer) {
            const provider = (issuer || acquirer).toUpperCase();
            channel = `QRIS (${provider})`;
        } else {
            channel = 'QRIS';
        }
    } else if (payment_type === 'gopay') {
        channel = 'GoPay';
    } else if (payment_type === 'shopeepay') {
        channel = 'ShopeePay';
    } else if (payment_type === 'cstore') {
        channel = store ? store.toUpperCase() : 'Convenience Store';
    } else if (payment_type === 'credit_card') {
        channel = 'Kartu Kredit / Debit';
    } else if (payment_type) {
        channel = payment_type.toUpperCase();
    }

    let vaNumber = null;
    if (Array.isArray(va_numbers) && va_numbers.length > 0 && va_numbers[0].va_number) {
        vaNumber = va_numbers[0].va_number;
    } else if (permata_va_number) {
        vaNumber = permata_va_number;
    }

    return {
        channel,
        transaction_id: transaction_id || null,
        va_number: vaNumber,
        settlement_time: settlement_time || transaction_time || null
    };
}

module.exports = {
    snap,
    extractMidtransPaymentDetails
};
