'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_poin_objek', {
      id_poin: {
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
      saldo_poin: {
        type: Sequelize.INTEGER
      },
      total_poin_didapat: {
        type: Sequelize.INTEGER
      },
      total_poin_digunakan: {
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
    await queryInterface.dropTable('dat_poin_objek');
  }
};