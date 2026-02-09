'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('dat_kelas', [
      {
        nama_kelas: 'Rumah Tinggal Kelas 1',
        tarif_kelas: 12800,
        deskripsi_kelas: 'Rumah Tinggal dengan luas tanah lebih dari 350 m2 atau daya listrik PLN terpasang lebih dari 3.500 VA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kelas: 'Rumah Tinggal Kelas 2',
        tarif_kelas: 9600,
        deskripsi_kelas: 'Rumah Tinggal dengan luas tanah lebih dari 60 m2 sampai 350 m2 atau daya listrik PLN terpasang dari mulai 900 VA sampai 3.500 VA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kelas: 'Rumah Tinggal Kelas 3',
        tarif_kelas: 6400,
        deskripsi_kelas: 'Rumah Tinggal dengan luas tanah sampai dengan 60 m2 atau daya listrik PLN terpasang 450 VA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kelas: 'Non Rumah Tinggal Kelas 1',
        tarif_kelas: null,
        deskripsi_kelas: 'Pertokoan, Industri, Restoran, Hotel/Penginapan, tempat hiburan, tempat wisata',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nama_kelas: 'Non Rumah Tinggal Kelas 2',
        tarif_kelas: null,
        deskripsi_kelas: 'Perkantoran, Pasar (Grosir/Toko/ Kios/Los/Lapangan), Rumah Sakit/ Fasilitas Kesehatan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_kelas', null, {});
  }
};
