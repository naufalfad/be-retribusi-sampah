'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefKategoriSampah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefKategoriSampah.hasMany(models.PengangkutanDetail, { foreignKey: 'id_kategori' });
    }
  }
  RefKategoriSampah.init({
    id_kategori: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nama_kategori: DataTypes.STRING,
    poin_per_m3: DataTypes.DECIMAL,
    satuan: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'RefKategoriSampah',
    tableName: 'ref_kategori_sampah'
  });
  return RefKategoriSampah;
};