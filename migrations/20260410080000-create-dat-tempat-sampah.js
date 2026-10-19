'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_tempat_sampah', {
      id_tempat_sampah: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_tempat: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kategori: {
        type: Sequelize.ENUM('BANK_SAMPAH', 'TPS', 'TPST', 'TPA'),
        allowNull: false
      },
      alamat: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      kecamatan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kelurahan_desa: {
        type: Sequelize.STRING,
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      koordinat: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: true
      },
      kapasitas_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      satuan_kapasitas: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'm3'
      },
      volume_saat_ini: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      status_operasional: {
        type: Sequelize.ENUM('Aktif', 'Penuh', 'Pemeliharaan', 'Non-Aktif'),
        allowNull: false,
        defaultValue: 'Aktif'
      },
      jenis_sampah: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      jam_operasional: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pengelola: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kontak: {
        type: Sequelize.STRING,
        allowNull: true
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      foto_url: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('dat_tempat_sampah');
  }
};
