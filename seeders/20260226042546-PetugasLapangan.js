'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('dat_petugas_lapangan', [
      {
        username: 'test.penagih@geocitra.com',
        password: hashedPassword,
        kelurahan: 'Babakan Madang',
        role: 'Penagih',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'penagih',
        password: hashedPassword,
        kelurahan: 'Babakan Madang',
        role: 'Penagih',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'test.pengangkut@geocitra.com',
        password: hashedPassword,
        kelurahan: 'Babakan Madang',
        role: 'Pengangkut',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'pengangkut',
        password: hashedPassword,
        kelurahan: 'Babakan Madang',
        role: 'Pengangkut',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dat_petugas_lapangan', null, {});
  }
};