'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dat_objek', {
      id_objek: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_subjek: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_subjek',
          key: 'id_subjek'

        }
      },
      id_kelas: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dat_kelas',
          key: 'id_kelas'
        }
      },
      kategori_objek: {
        type: Sequelize.STRING
      },
      nama_objek: {
        type: Sequelize.STRING
      },
      alamat_objek: {
        type: Sequelize.STRING
      },
      rt_rw_objek: {
        type: Sequelize.STRING
      },
      telepon_objek: {
        type: Sequelize.STRING
      },
      provinsi_objek: {
        type: Sequelize.STRING
      },
      kabupaten_objek: {
        type: Sequelize.STRING
      },
      kecamatan_objek: {
        type: Sequelize.STRING
      },
      kelurahan_objek: {
        type: Sequelize.STRING
      },
      kode_pos_objek: {
        type: Sequelize.STRING
      },
      koordinat_objek: {
        type: Sequelize.GEOMETRY('POINT', 4326),
        allowNull: false
      },
      tarif_pokok_objek: {
        type: Sequelize.DECIMAL
      },
      npor_objek: {
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
    await queryInterface.dropTable('dat_objek');
  }
};