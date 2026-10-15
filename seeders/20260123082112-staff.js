'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('dat_staff', [
      {
        username: 'unit@geocitra.com',
        password: hashedPassword,
        role: 'UPT',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'dinas@geocitra.com',
        password: hashedPassword,
        role: 'DLH',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'bendahara@geocitra.com',
        password: hashedPassword,
        role: 'Bendahara',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin@geocitra.com',
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