'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_pengangkutan', {
      id_pengangkutan: {
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
      id_petugas: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_petugas_lapangan',
          key: 'id_petugas'
        }
      },
      tgl_pengangkutan: {
        type: Sequelize.DATE
      },
      total_poin_transaksi: {
        type: Sequelize.INTEGER
      },
      foto_bukti: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('dat_pengangkutan');
  }
};