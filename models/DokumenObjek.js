'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DokumenObjek extends Model {
    static associate(models) {
      DokumenObjek.belongsTo(models.Objek, { foreignKey: 'id_objek' });
    }
  }
  DokumenObjek.init({
    id_dokumen_objek: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_objek: DataTypes.INTEGER,
    file_path: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DokumenObjek',
    tableName: 'dat_dokumen_objek'
  });
  return DokumenObjek;
};