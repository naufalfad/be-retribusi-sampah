'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ref_pelayanan_skrd', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_skrd: {
        type: Sequelize.INTEGER,
      },
      id_pelayanan: {
        type: Sequelize.INTEGER
      },
      nama_pelayanan: {
        type: Sequelize.STRING
      },
      tarif_pelayanan: {
        type: Sequelize.DECIMAL
      },
      volume: {
        type: Sequelize.DECIMAL
      },
      sub_total: {
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
    await queryInterface.dropTable('ref_pelayanan_skrd');
  }
};