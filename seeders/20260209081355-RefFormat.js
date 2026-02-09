'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ref_form', [
      {
        nama_pemda: 'Pemerintahan Kota',
        dinas_pelaksana: 'Dinas Lingkungan Hidup',
        alamat_pemda: 'Jl.Yos Sunaryo',
        nama_pejabat: 'Irawan',
        nip_pejabat: '223144151666',
        jabatan_pejabat: 'Kepala Dinas',
        format_skrd: 'SKRD/001',
        format_ssrd: 'SSRD/001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ref_form', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
