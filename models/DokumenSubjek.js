'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DokumenSubjek extends Model {
    static associate(models) {
      DokumenSubjek.belongsTo(models.Subjek, { foreignKey: 'id_subjek' });
    }
  }
  DokumenSubjek.init({
    id_dokumen_subjek: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_subjek: DataTypes.INTEGER,
    file_path: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DokumenSubjek',
    tableName: 'dat_dokumen_subjek'
  });
  return DokumenSubjek;
};