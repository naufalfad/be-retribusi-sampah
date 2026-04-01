'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PetugasLapangan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PetugasLapangan.hasMany(models.Pengangkutan, { foreignKey: 'id_petugas' });
    }
  }
  PetugasLapangan.init({
    id_petugas: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    kelurahan: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PetugasLapangan',
    tableName: 'dat_petugas_lapangan'
  });
  return PetugasLapangan;
};