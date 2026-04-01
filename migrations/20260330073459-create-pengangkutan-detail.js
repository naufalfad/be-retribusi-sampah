'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_pengangkutan_detail', {
      id_detail: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_pengangkutan: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_pengangkutan',
          key: 'id_pengangkutan'
        }
      },
      id_kategori: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ref_kategori_sampah',
          key: 'id_kategori'
        }
      },
      volume: {
        type: Sequelize.DECIMAL
      },
      subtotal_poin_transaksi: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('dat_pengangkutan_detail');
  }
};