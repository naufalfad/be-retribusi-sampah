'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Skrd extends Model {
    static associate(models) {
      Skrd.belongsTo(models.Objek, { foreignKey: 'id_objek' });
      Skrd.hasOne(models.Ssrd, { foreignKey: 'id_skrd' });
      Skrd.hasMany(models.RefPelayananSkrd, { foreignKey: 'id_skrd', as: 'pelayanan' });
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
    periode_bulan: DataTypes.INTEGER,
    periode_tahun: DataTypes.INTEGER,
    masa: DataTypes.INTEGER,
    jatuh_tempo: DataTypes.DATE,
    denda: {
      type: DataTypes.DECIMAL,
      defaultValue: null
    },
    total_bayar: DataTypes.DECIMAL,
    status: {
      type: DataTypes.STRING
    },
    parent_id: DataTypes.INTEGER,
    tipe_skrd: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Skrd',
    tableName: 'dat_skrd'
  });
  return Skrd;
};