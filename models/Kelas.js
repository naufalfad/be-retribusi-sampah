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
      Kelas.hasMany(models.RefPelayanan, { foreignKey: 'id_kelas', as: 'pelayanan' });
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
  }, {
    sequelize,
    modelName: 'Kelas',
    tableName: 'dat_kelas'
  });
  return Kelas;
};