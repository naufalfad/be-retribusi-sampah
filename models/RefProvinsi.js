'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefProvinsi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefProvinsi.hasMany(models.RefKabupaten, { foreignKey: 'id_provinsi' });
    }
  }
  RefProvinsi.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefProvinsi',
    tableName: 'ref_provinsi'
  });
  return RefProvinsi;
};