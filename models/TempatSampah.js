'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TempatSampah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Dapat dihubungkan dengan jadwal pengangkutan / monitoring volume di masa mendatang
    }
  }

  TempatSampah.init({
    id_tempat_sampah: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama_tempat: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kategori: {
      type: DataTypes.ENUM('BANK_SAMPAH', 'TPS', 'TPST', 'TPA'),
      allowNull: false
    },
    alamat: DataTypes.TEXT,
    kecamatan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kelurahan_desa: DataTypes.STRING,
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false
    },
    koordinat: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: true
    },
    kapasitas_total: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    satuan_kapasitas: {
      type: DataTypes.STRING,
      defaultValue: 'm3'
    },
    volume_saat_ini: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    status_operasional: {
      type: DataTypes.ENUM('Aktif', 'Penuh', 'Pemeliharaan', 'Non-Aktif'),
      defaultValue: 'Aktif'
    },
    jenis_sampah: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    jam_operasional: DataTypes.STRING,
    pengelola: DataTypes.STRING,
    kontak: DataTypes.STRING,
    keterangan: DataTypes.TEXT,
    foto: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    foto_url: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'TempatSampah',
    tableName: 'dat_tempat_sampah'
  });

  return TempatSampah;
};
