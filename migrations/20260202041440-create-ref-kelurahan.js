'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ref_kelurahan', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        unique: true
      },
      id_kecamatan: {
        type: Sequelize.STRING,
        references: {
          model: 'ref_kecamatan',
          key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING
      },
      kode_pos: {
        type: Sequelize.STRING
      },
      lokasi: {
        type: Sequelize.GEOMETRY('POINT', 4326),
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
    await queryInterface.dropTable('ref_kelurahan');
  }
};