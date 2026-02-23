'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('dat_staff', [
      {
        username: 'test.unit@geocitra.com',
        password: hashedPassword,
        role: 'UPT',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'test.dinas@geocitra.com',
        password: hashedPassword,
        role: 'DLH',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'test.bendahara@geocitra.com',
        password: hashedPassword,
        role: 'Bendahara',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'test.admin@geocitra.com',
        password: hashedPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'test.penagih@geocitra.com',
        password: hashedPassword,
        role: 'Penagih',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_staff', null, {});
  }
};