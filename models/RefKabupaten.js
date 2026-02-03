'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefKabupaten extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefKabupaten.belongsTo(models.RefProvinsi, { foreignKey: 'id_provinsi' });
      RefKabupaten.hasMany(models.RefKecamatan, { foreignKey: 'id_kecamatan' });
    }
  }
  RefKabupaten.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    id_provinsi: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefKabupaten',
    tableName: 'ref_kabupaten'
  });
  return RefKabupaten;
};