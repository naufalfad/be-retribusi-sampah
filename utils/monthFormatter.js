// utils/masaFormatter.js

const daftarBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/**
 * Mengonversi bulan awal dan durasi menjadi string Masa
 * @param {number|string} periodeBulan - Angka bulan (1-12)
 * @param {number|string} masa - Durasi bulan (misal 1 atau 2)
 * @returns {string} - Contoh: "JANUARI" atau "FEBRUARI - MARET"
 */
function formatMasa(periodeBulan, masa) {
    const bulanMulaiIdx = parseInt(periodeBulan) - 1;
    const durasi = parseInt(masa) || 1;

    // Validasi jika data tidak valid
    if (isNaN(bulanMulaiIdx) || bulanMulaiIdx < 0 || bulanMulaiIdx > 11) {
        return "-";
    }

    if (durasi <= 1) {
        return daftarBulan[bulanMulaiIdx].toUpperCase();
    } else {
        const bulanSelesaiIdx = (bulanMulaiIdx + durasi - 1) % 12;
        return `${daftarBulan[bulanMulaiIdx].toUpperCase()} - ${daftarBulan[bulanSelesaiIdx].toUpperCase()}`;
    }
}

module.exports = { formatMasa };