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
        type: Sequelize.STRING
      },
      midtrans_order_id: {
        type: Sequelize.STRING
      },
      midtrans_transaction_id: {
        type: Sequelize.STRING
      },
      snap_token: {
        type: Sequelize.STRING
      },
      va_number: {
        type: Sequelize.STRING
      },
      payment_code: {
        type: Sequelize.STRING
      },
      rejected_reason: {
        type: Sequelize.STRING
      },
      catatan_bendahara: {
        type: Sequelize.STRING
      },
      points_used: {
        type: Sequelize.INTEGER
      },
      point_value: {
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
    await queryInterface.dropTable('dat_ssrd');
  }
};