'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ref_kabupaten', [
      {
        id: '32.01',
        id_provinsi: '32',
        name: 'KAB. BOGOR'
      },
      {
        id: '32.71',
        id_provinsi: '32',
        name: 'KOTA BOGOR'
      },
      {
        id: '32.76',
        id_provinsi: '32',
        name: 'KOTA DEPOK'
      },
      {
        id: '32.75',
        id_provinsi: '32',
        name: 'KOTA BEKASI'
      },
      {
        id: '32.16',
        id_provinsi: '32',
        name: 'KAB. BEKASI'
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ref_kabupaten', {
      id: ['32.01', '32.71', '32.76', '32.75', '32.16']
    });
  }
};
