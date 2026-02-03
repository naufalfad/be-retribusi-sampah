'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_ssrd', {
      id_ssrd: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_skrd: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_skrd',
          key: 'id_skrd'
        }
      },
      no_ssrd: {
        type: Sequelize.STRING
      },
      payment_method: {
        type: Sequelize.STRING
      },
      amount_paid: {
        type: Sequelize.DECIMAL
      },
      paid_at: {
        type: Sequelize.DATE
      },
      payment_status: {
        type: Sequelize.ENUM('paid', 'unpaid', 'pending', 'expired'),
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
    await queryInterface.dropTable('dat_ssrd');
  }
};