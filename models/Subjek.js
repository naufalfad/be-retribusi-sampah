'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subjek extends Model {
    static associate(models) {
      Subjek.hasMany(models.Objek, { foreignKey: 'id_subjek' });
      Subjek.belongsTo(models.Staff, { foreignKey: 'id_staff' });
      Subjek.hasMany(models.DokumenSubjek, { foreignKey: 'id_subjek' });
    }
  }
  Subjek.init({
    id_subjek: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_staff: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kategori_subjek: {
      type: DataTypes.ENUM('Pribadi', 'Badan'),
      allowNull: false
    },
    nama_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    penanggung_jawab_subjek: {
      type: DataTypes.STRING,
      allowNull: true
    },
    npwp_subjek: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nik_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telepon_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alamat_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rt_rw_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provinsi_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kabupaten_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kecamatan_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kelurahan_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kode_pos_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    npwrd_subjek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status_subjek: {
      type: DataTypes.ENUM('Aktif', 'Non-Aktif', 'Pending'),
      defaultValue: 'Pending'
    }
  }, {
    sequelize,
    modelName: 'Subjek',
    tableName: 'dat_subjek'
  });
  return Subjek;
};