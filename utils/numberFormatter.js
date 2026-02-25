/**
 * Mengonversi angka menjadi teks terbilang bahasa Indonesia
 * @param {number} n 
 * @returns {string}
 */
function angkaKeTerbilang(n) {
    const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let hasil = "";

    // Pastikan input adalah angka dan hilangkan desimal
    const nilai = Math.floor(Math.abs(parseFloat(n)));

    if (nilai < 12) {
        hasil = angka[nilai];
    } else if (nilai < 20) {
        hasil = angkaKeTerbilang(nilai - 10) + " Belas";
    } else if (nilai < 100) {
        hasil = angkaKeTerbilang(Math.floor(nilai / 10)) + " Puluh " + angkaKeTerbilang(nilai % 10);
    } else if (nilai < 200) {
        hasil = "Seratus " + angkaKeTerbilang(nilai - 100);
    } else if (nilai < 1000) {
        hasil = angkaKeTerbilang(Math.floor(nilai / 100)) + " Ratus " + angkaKeTerbilang(nilai % 100);
    } else if (nilai < 2000) {
        hasil = "Seribu " + angkaKeTerbilang(nilai - 1000);
    } else if (nilai < 1000000) {
        hasil = angkaKeTerbilang(Math.floor(nilai / 1000)) + " Ribu " + angkaKeTerbilang(nilai % 1000);
    } else if (nilai < 1000000000) {
        hasil = angkaKeTerbilang(Math.floor(nilai / 1000000)) + " Juta " + angkaKeTerbilang(nilai % 1000000);
    } else if (nilai < 1000000000000) {
        hasil = angkaKeTerbilang(Math.floor(nilai / 1000000000)) + " Miliar " + angkaKeTerbilang(nilai % 1000000000);
    } else if (nilai < 1000000000000000) {
        hasil = angkaKeTerbilang(Math.floor(nilai / 1000000000000)) + " Triliun " + angkaKeTerbilang(nilai % 1000000000000);
    }

    return hasil.replace(/\s+/g, ' ').trim();
}

/**
 * Helper untuk format mata uang IDR
 */
function formatRupiah(n) {
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n);
}

module.exports = { angkaKeTerbilang, formatRupiah };