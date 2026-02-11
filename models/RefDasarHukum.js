'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefDasarHukum extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RefDasarHukum.init({
    judul: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    jenis: DataTypes.ENUM('PERBUP', 'PERDA', 'SOP', 'UU', 'PERDIN'),
    tahun: DataTypes.INTEGER,
    dokumen_peraturan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefDasarHukum',
    tableName: 'ref_dasar_hukum'
  });
  return RefDasarHukum;
};