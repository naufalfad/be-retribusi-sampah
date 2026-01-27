'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DokumenObjek extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DokumenObjek.belongsTo(models.Objek, { foreignKey: 'id_objek' });
    }
  }
  DokumenObjek.init({
    id_dokumen: {
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