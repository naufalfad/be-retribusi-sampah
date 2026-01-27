'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('12345678', 10);

    await queryInterface.bulkInsert('dat_staff', [
      {
        username: 'unit',
        password: hashedPassword,
        role: 'UPT',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'dinas',
        password: hashedPassword,
        role: 'DLH',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'bendahara',
        password: hashedPassword,
        role: 'Bendahara',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        password: hashedPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_staff', null, {});
  }
};