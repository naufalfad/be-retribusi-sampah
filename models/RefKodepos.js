'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefKodepos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefKodepos.belongsTo(models.RefKelurahan, { foreignKey: 'id_kelurahan' });
    }
  }
  RefKodepos.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    id_kelurahan: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefKodepos',
    tableName: 'ref_kodepos'
  });
  return RefKodepos;
};