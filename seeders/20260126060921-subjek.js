'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('12345678', 10);
    await queryInterface.bulkInsert('dat_subjek', [
      {
        id_staff: 1,
        nama_subjek: 'kardi',
        nik_subjek: '124422928',
        telepon_subjek: '0837388211',
        email_subjek: 'kk@gmail.com',
        alamat_subjek: 'Jl.Path No.10',
        rt_rw_subjek: 'RT02/RW12',
        kabupaten_subjek: 'Wanimpiro',
        kecamatan_subjek: 'Ngamprah',
        kelurahan_subjek: 'Cibeber',
        kode_pos_subjek: '46338',
        dokumen_subjek: 'pdf',
        password_subjek: hashedPassword,
        npwrd_subjek: '1.2203.2201',
        status_subjek: 'Aktif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id_staff: 1,
        nama_subjek: 'lissa',
        nik_subjek: '124422111',
        telepon_subjek: '083732922',
        email_subjek: 'll@gmail.com',
        alamat_subjek: 'Jl.Path No.11',
        rt_rw_subjek: 'RT02/RW12',
        kabupaten_subjek: 'Wanimpiro',
        kecamatan_subjek: 'Ngamprah',
        kelurahan_subjek: 'Cibeber',
        kode_pos_subjek: '46338',
        dokumen_subjek: 'pdf',
        password_subjek: hashedPassword,
        npwrd_subjek: '1.2203.2202',
        status_subjek: 'Aktif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_subjek', null, {});
  }
};
