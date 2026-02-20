'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LogAktivitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LogAktivitas.init({
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: DataTypes.INTEGER,
    role: DataTypes.STRING,
    aksi: DataTypes.STRING,
    modul: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    data_lama: DataTypes.JSON,
    data_baru: DataTypes.JSON,
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'LogAktivitas',
    tableName: 'dat_log_aktivitas'
  });
  return LogAktivitas;
};