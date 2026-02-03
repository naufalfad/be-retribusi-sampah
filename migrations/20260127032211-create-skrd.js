'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_skrd', {
      id_skrd: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_objek: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_objek',
          key: 'id_objek'
        }
      },
      no_skrd: {
        type: Sequelize.STRING
      },
      periode_bulan: {
        type: Sequelize.DATE
      },
      periode_tahun: {
        type: Sequelize.DATE
      },
      masa: {
        type: Sequelize.INTEGER
      },
      jatuh_tempo: {
        type: Sequelize.DATE
      },
      denda: {
        type: Sequelize.DECIMAL,
        defaultValue: null
      },
      total_bayar: {
        type: Sequelize.DECIMAL
      },
      status: {
        type: Sequelize.ENUM('paid', 'pending', 'unpaid', 'expired'),
        defaultValue: 'unpaid'
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
    await queryInterface.dropTable('dat_skrd');
  }
};