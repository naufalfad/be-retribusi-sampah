'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ref_form', {
      id_form: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_pemda: {
        type: Sequelize.STRING
      },
      dinas_pelaksana: {
        type: Sequelize.STRING
      },
      alamat_pemda: {
        type: Sequelize.STRING
      },
      nama_pejabat: {
        type: Sequelize.STRING
      },
      nip_pejabat: {
        type: Sequelize.STRING
      },
      jabatan_pejabat: {
        type: Sequelize.STRING
      },
      format_skrd: {
        type: Sequelize.STRING
      },
      format_ssrd: {
        type: Sequelize.STRING
      },
      logo: {
        type: Sequelize.STRING
      },
      ttd_pejabat: {
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
    await queryInterface.dropTable('ref_form');
  }
};