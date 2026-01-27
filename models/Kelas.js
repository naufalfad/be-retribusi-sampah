'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Kelas.hasMany(models.Objek, { foreignKey: 'id_kelas', as: 'objek' });
    }
  }
  Kelas.init({
    id_kelas: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama_kelas: DataTypes.STRING,
    deskripsi_kelas: DataTypes.TEXT,
    tarif_kelas: DataTypes.DECIMAL,
    pelayanan_1: DataTypes.TEXT,
    pelayanan_2: DataTypes.TEXT,
    pelayanan_3: DataTypes.TEXT,
    tarif_pelayanan_1: DataTypes.DECIMAL,
    tarif_pelayanan_2: DataTypes.DECIMAL,
    tarif_pelayanan_3: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Kelas',
    tableName: 'dat_kelas'
  });
  return Kelas;
};