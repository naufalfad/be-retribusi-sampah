'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('dat_penagih', [
      {
        username: 'test.penagih@geocitra.com',
        password: hashedPassword,
        kelurahan: 'Keude Bakongan',
        role: 'Penagih',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'penagih',
        password: hashedPassword,
        kelurahan: 'Keu Gadobangkong',
        role: 'Penagih',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_penagih', null, {});
  }
};