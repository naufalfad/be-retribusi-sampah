'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ref_pelayanan', {
      id_pelayanan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_kelas: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_kelas',
          key: 'id_kelas'
        }
      },
      nama_pelayanan: {
        type: Sequelize.STRING
      },
      tarif_pelayanan: {
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
    await queryInterface.dropTable('ref_pelayanan');
  }
};