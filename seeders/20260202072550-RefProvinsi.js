'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ref_provinsi', [
      {
        id: '32',
        name: 'Jawa Barat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '36',
        name: 'Banten',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '31',
        name: 'DKI Jakarta',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ref_provinsi', {
      id: ['32', '36', '31']
    });
  }
};
