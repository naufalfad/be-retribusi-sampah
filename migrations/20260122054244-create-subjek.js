'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_subjek', {
      id_subjek: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_staff: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_staff',
          key: 'id_staff'
        },
        allowNull: false
      },
      kategori_subjek: {
        type: Sequelize.ENUM('Pribadi', 'Badan'),
        allowNull: false
      },
      nama_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      penanggung_jawab_subjek: {
        type: Sequelize.STRING,
        allowNull: true
      },
      npwp_subjek: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nik_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      telepon_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email_subjek: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      alamat_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rt_rw_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provinsi_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kabupaten_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kecamatan_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kelurahan_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kode_pos_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password_subjek: {
        type: Sequelize.STRING,
        allowNull: true
      },
      npwrd_subjek: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status_subjek: {
        type: Sequelize.ENUM('Aktif', 'Non-Aktif', 'Pending'),
        defaultValue: 'Pending'
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
    await queryInterface.dropTable('dat_subjek');
  }
};