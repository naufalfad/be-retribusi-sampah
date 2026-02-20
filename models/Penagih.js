'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DatPenagih extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DatPenagih.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    kelurahan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Penagih',
    tableName: 'dat_penagih'
  });
  return DatPenagih;
};