'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_kelas', {
      id_kelas: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_kelas: {
        type: Sequelize.STRING
      },
      deskripsi_kelas: {
        type: Sequelize.TEXT
      },
      tarif_kelas: {
        type: Sequelize.DECIMAL
      },
      pelayanan_1: {
        type: Sequelize.TEXT
      },
      pelayanan_2: {
        type: Sequelize.TEXT
      },
      pelayanan_3: {
        type: Sequelize.TEXT
      },
      tarif_pelayanan_1: {
        type: Sequelize.DECIMAL
      },
      tarif_pelayanan_2: {
        type: Sequelize.DECIMAL
      },
      tarif_pelayanan_3: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dat_kelas');
  }
};