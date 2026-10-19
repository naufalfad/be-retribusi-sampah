'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const facilities = [
      // 1. TPA
      {
        nama_tempat: "TPA Galuga Kabupaten Bogor",
        kategori: "TPA",
        alamat: "Jl. Raya Galuga, Kec. Cibungbulang, Kabupaten Bogor",
        kecamatan: "Cibungbulang",
        kelurahan_desa: "Galuga",
        latitude: -6.5518200,
        longitude: 106.6341200,
        kapasitas_total: 45000,
        satuan_kapasitas: "ton/hari",
        volume_saat_ini: 38250,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Residu Akhir",
          "Sampah Domestik Campuran",
          "Sampah Non-Daur Ulang"
        ]),
        jam_operasional: "24 Jam Setiap Hari",
        pengelola: "UPT Pengelolaan Sampah Wilayah Cibungbulang - DLH Kab. Bogor",
        kontak: "0812-8899-0011",
        keterangan: "Pusat pemrosesan akhir sampah skala kabupaten, menampung kiriman dari seluruh TPS dan TPST wilayah Kabupaten Bogor.",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 2. TPST
      {
        nama_tempat: "TPST 3R Bojonggede Mandiri Bersih",
        kategori: "TPST",
        alamat: "Jl. Raya Bojonggede No. 45, Kec. Bojonggede, Kabupaten Bogor",
        kecamatan: "Bojonggede",
        kelurahan_desa: "Bojonggede",
        latitude: -6.4952000,
        longitude: 106.7974000,
        kapasitas_total: 40,
        satuan_kapasitas: "ton/hari",
        volume_saat_ini: 26,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Organik (Komposting & Maggot)",
          "Plastik Daur Ulang",
          "Kertas & Kardus",
          "Residu Ringan"
        ]),
        jam_operasional: "Senin - Sabtu (06:00 - 17:00)",
        pengelola: "KSM Swadaya Mandiri binaan DLH Kab. Bogor",
        kontak: "0813-1122-3344",
        keterangan: "Fasilitas pengolahan terpadu berbasis 3R, dilengkapi rumah kompos dan unit pengolahan RDF.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_tempat: "TPST 3R Sukaraja Lestari",
        kategori: "TPST",
        alamat: "Jl. Raya Sukaraja - Cikeas, Kec. Sukaraja, Kabupaten Bogor",
        kecamatan: "Sukaraja",
        kelurahan_desa: "Cikeas",
        latitude: -6.5415000,
        longitude: 106.8423000,
        kapasitas_total: 30,
        satuan_kapasitas: "ton/hari",
        volume_saat_ini: 18,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Organik",
          "Plastik Kemasan",
          "Kardus/Kertas",
          "Logam/Besi"
        ]),
        jam_operasional: "Senin - Sabtu (07:00 - 16:00)",
        pengelola: "UPT DLH Wilayah Sukaraja",
        kontak: "0812-9988-7766",
        keterangan: "Pusat pemilahan dan pengolahan sampah organik skala kawasan Sukaraja.",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 3. TPS
      {
        nama_tempat: "TPS Terpadu Pasar Cibinong",
        kategori: "TPS",
        alamat: "Kompleks Pasar Cibinong, Jl. Mayor Oking Jaya Atmaja, Cibinong",
        kecamatan: "Cibinong",
        kelurahan_desa: "Ciriung",
        latitude: -6.4789000,
        longitude: 106.8625000,
        kapasitas_total: 45,
        satuan_kapasitas: "m3",
        volume_saat_ini: 31,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Pasar Organik",
          "Karton & Kardus",
          "Sampah Domestik Sekitar"
        ]),
        jam_operasional: "Setiap Hari (05:00 - 20:00)",
        pengelola: "PD Pasar Tohaga & Dinas Lingkungan Hidup",
        kontak: "0812-7766-5544",
        keterangan: "Penampungan sementara sebelum diangkut armada truk DLH ke TPA Galuga.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_tempat: "TPS Kawasan Babakan Madang - Sentul",
        kategori: "TPS",
        alamat: "Jl. MH Thamrin Kawasan Sentul City, Babakan Madang",
        kecamatan: "Babakan Madang",
        kelurahan_desa: "Citaringgul",
        latitude: -6.5592000,
        longitude: 106.8694000,
        kapasitas_total: 35,
        satuan_kapasitas: "m3",
        volume_saat_ini: 19,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Rumah Tangga",
          "Sampah Kebun / Dahan",
          "Sampah Campuran"
        ]),
        jam_operasional: "Setiap Hari (06:00 - 18:00)",
        pengelola: "Kemitraan Pengelola Kawasan & DLH Kab. Bogor",
        kontak: "0811-3322-1100",
        keterangan: "TPS kontainer arm-roll untuk warga perumahan dan komersil Babakan Madang.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_tempat: "TPS Transit Ciawi Puncak",
        kategori: "TPS",
        alamat: "Jl. Raya Ciawi - Puncak KM 1, Ciawi, Kabupaten Bogor",
        kecamatan: "Ciawi",
        kelurahan_desa: "Bendungan",
        latitude: -6.6578000,
        longitude: 106.8521000,
        kapasitas_total: 30,
        satuan_kapasitas: "m3",
        volume_saat_ini: 24,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Domestik Warga",
          "Residu Niaga",
          "Kemasan Makanan"
        ]),
        jam_operasional: "Setiap Hari (05:00 - 19:00)",
        pengelola: "UPT Pengelolaan Sampah Ciawi",
        kontak: "0813-5544-3322",
        keterangan: "Titik kumpul sementara sampah jalur utama Ciawi sebelum pengangkutan terjadwal.",
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 4. BANK SAMPAH (Spesifik jenis sampah bernilai jual)
      {
        nama_tempat: "Bank Sampah Unit Berkah Asri Cibinong",
        kategori: "BANK_SAMPAH",
        alamat: "Jl. Gor Barat Pakansari No. 12, RT 03/RW 06, Cibinong",
        kecamatan: "Cibinong",
        kelurahan_desa: "Pakansari",
        latitude: -6.4855000,
        longitude: 106.8398000,
        kapasitas_total: 5000,
        satuan_kapasitas: "kg",
        volume_saat_ini: 2150,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Botol Plastik Bersih (PET)",
          "Gelas Mineral Plastik (PP)",
          "Kardus & Karton Tebal"
        ]),
        jam_operasional: "Selasa & Sabtu (08:30 - 14:00)",
        pengelola: "Ibu Nurhayati (KSM Berkah Asri Pakansari)",
        kontak: "0812-3456-7890",
        keterangan: "HANYA menerima botol plastik PET bersih tanpa label dan kardus kering. Tidak menerima plastik kresek atau minyak jelantah.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_tempat: "Bank Sampah Barokah Berseri Sentul",
        kategori: "BANK_SAMPAH",
        alamat: "Jl. Raya Babakan Madang RT 02/03, Dekat Kantor Desa",
        kecamatan: "Babakan Madang",
        kelurahan_desa: "Babakan Madang",
        latitude: -6.5714000,
        longitude: 106.8778000,
        kapasitas_total: 4000,
        satuan_kapasitas: "kg",
        volume_saat_ini: 1680,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Botol Plastik PET",
          "Tutup Botol HDPE",
          "Kaleng Aluminium / Logam",
          "Minyak Jelantah (UCO)",
          "Besi Rongsok"
        ]),
        jam_operasional: "Rabu & Minggu (09:00 - 15:00)",
        pengelola: "Pak Budi Santoso & Karang Taruna Babakan Madang",
        kontak: "0857-1234-5678",
        keterangan: "Menerima minyak jelantah (minimal 1 botol) dan logam kaleng/besi. Memberikan tabungan uang / emas mini bagi warga.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_tempat: "Bank Sampah Hijau Lestari Bojonggede",
        kategori: "BANK_SAMPAH",
        alamat: "Jl. Raya Kedung Waringin No. 88, Bojonggede",
        kecamatan: "Bojonggede",
        kelurahan_desa: "Kedung Waringin",
        latitude: -6.4912000,
        longitude: 106.8115000,
        kapasitas_total: 3500,
        satuan_kapasitas: "kg",
        volume_saat_ini: 1200,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Kertas HVS / Arsip / Majalah",
          "Kardus Box",
          "Botol Kaca / Beling Utuh",
          "Buku Bekas"
        ]),
        jam_operasional: "Senin, Kamis, Sabtu (08:00 - 13:00)",
        pengelola: "Ibu Sri Wahyuni (Komunitas Peduli Lingkungan)",
        kontak: "0813-8877-6655",
        keterangan: "Spesialis daur ulang kertas dan botol beling/kaca. Mohon kertas dalam kondisi kering tidak berminyak.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_tempat: "Bank Sampah E-Waste & Logam Resik Mandiri",
        kategori: "BANK_SAMPAH",
        alamat: "Jl. Raya Cibungbulang No. 23, Cibungbulang",
        kecamatan: "Cibungbulang",
        kelurahan_desa: "Cimanggu 1",
        latitude: -6.5684000,
        longitude: 106.6712000,
        kapasitas_total: 3000,
        satuan_kapasitas: "kg",
        volume_saat_ini: 850,
        status_operasional: "Aktif",
        jenis_sampah: JSON.stringify([
          "Sampah Elektronik / E-Waste (HP, Kabel, PCB)",
          "Aki Bekas",
          "Tembaga & Kuningan",
          "Kaleng Logam"
        ]),
        jam_operasional: "Jumat & Sabtu (09:00 - 16:00)",
        pengelola: "Koperasi Daur Ulang Mandiri Cibungbulang",
        kontak: "0878-1122-4466",
        keterangan: "Pusat setor limbah elektronik rumah tangga dan logam bernilai jual tinggi.",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Buat data dengan PostGIS point
    const records = facilities.map(f => ({
      ...f,
      koordinat: Sequelize.fn('ST_SetSRID', Sequelize.fn('ST_MakePoint', f.longitude, f.latitude), 4326)
    }));

    await queryInterface.bulkInsert('dat_tempat_sampah', records, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_tempat_sampah', null, {});
  }
};
