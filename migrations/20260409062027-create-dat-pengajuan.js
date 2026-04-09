'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_pengajuan', {
      id_pengajuan: {
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
        },
        onUpdate: 'CASCADE', onDelete: 'CASCADE'
      },
      id_subjek: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_subjek',
          key: 'id_subjek'
        }
      },
      jenis_pengajuan: {
        type: Sequelize.ENUM('Perubahan Data', 'Penonaktifan'),
        allowNull: false
      },
      data_lama: {
        type: Sequelize.JSONB
      },
      data_baru: {
        type: Sequelize.JSONB
      },
      alasan: {
        type: Sequelize.TEXT
      },
      file_pendukung: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Disetujui', 'Ditolak'),
        defaultValue: 'Pending'
      },
      catatan_dinas: {
        type: Sequelize.TEXT
      },
      id_staff: {
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
    await queryInterface.dropTable('dat_pengajuan');
  }
};