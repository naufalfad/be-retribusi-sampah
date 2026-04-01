'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PoinObjek extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PoinObjek.belongsTo(models.Objek, { foreignKey: 'id_objek' });
    }
  }
  PoinObjek.init({
    id_poin: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_objek: DataTypes.INTEGER,
    saldo_poin: DataTypes.INTEGER,
    total_poin_didapat: DataTypes.INTEGER,
    total_poin_digunakan: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PoinObjek',
    tableName: 'dat_poin_objek'
  });
  return PoinObjek;
};