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
        type: Sequelize.INTEGER
      },
      periode_tahun: {
        type: Sequelize.INTEGER
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
        type: Sequelize.STRING
      },
      parent_id: {
        type: Sequelize.INTEGER
      },
      tipe_skrd: {
        type: Sequelize.TEXT
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