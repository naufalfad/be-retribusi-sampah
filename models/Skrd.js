'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Skrd extends Model {
    static associate(models) {
      Skrd.belongsTo(models.Objek, { foreignKey: 'id_objek' });
    }
  }
  Skrd.init({
    id_skrd: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_objek: DataTypes.INTEGER,
    no_skrd: DataTypes.STRING,
    periode_bulan: DataTypes.DATE,
    periode_tahun: DataTypes.DATE,
    masa: DataTypes.INTEGER,
    jatuh_tempo: DataTypes.DATE,
    denda: {
      type: DataTypes.DECIMAL,
      defaultValue: null
    },
    total_bayar: DataTypes.DECIMAL,
    status: {
      type: DataTypes.ENUM('paid', 'unpaid', 'expired'),
      defaultValue: 'unpaid'
    }
  }, {
    sequelize,
    modelName: 'Skrd',
    tableName: 'dat_skrd'
  });
  return Skrd;
};