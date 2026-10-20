'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('dat_tempat_sampah', 'foto_url', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    // Check if column foto already exists before adding
    const tableInfo = await queryInterface.describeTable('dat_tempat_sampah');
    if (!tableInfo.foto) {
      await queryInterface.addColumn('dat_tempat_sampah', 'foto', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('dat_tempat_sampah');
    if (tableInfo.foto) {
      await queryInterface.removeColumn('dat_tempat_sampah', 'foto');
    }
    await queryInterface.changeColumn('dat_tempat_sampah', 'foto_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
