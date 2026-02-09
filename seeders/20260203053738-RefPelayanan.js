'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ref_pelayanan', [
      {
        id_kelas: 1,
        nama_pelayanan: 'Tarif Retribusi Rumah Tinggal Dari TPS/TPST',
        tarif_pelayanan: 56950,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 2,
        nama_pelayanan: 'Tarif Retribusi Rumah Tinggal Dari TPS/TPST',
        tarif_pelayanan: 56950,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 3,
        nama_pelayanan: 'Tarif Retribusi Rumah Tinggal Dari TPS/TPST',
        tarif_pelayanan: 56950,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 4,
        nama_pelayanan: 'Pelayanan dari sumber sampah',
        tarif_pelayanan: 67000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 4,
        nama_pelayanan: 'Pelayanan pengangkutan dari TPS/TPST',
        tarif_pelayanan: 60300,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 4,
        nama_pelayanan: 'Pelayanan Pemrosesan Akhir sampah',
        tarif_pelayanan: 50520,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 5,
        nama_pelayanan: 'Pelayanan dari sumber sampah',
        tarif_pelayanan: 63650,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 5,
        nama_pelayanan: 'Pelayanan pengangkutan dari TPS/TPST',
        tarif_pelayanan: 56950,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_kelas: 5,
        nama_pelayanan: 'Pelayanan Pemrosesan Akhir sampah',
        tarif_pelayanan: 46900,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ref_kelas', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
