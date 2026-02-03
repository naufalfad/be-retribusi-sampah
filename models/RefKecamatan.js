'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefKecamatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefKecamatan.belongsTo(models.RefKabupaten, { foreignKey: 'id_kabupaten' });
      RefKecamatan.hasMany(models.RefKelurahan, { foreignKey: 'id_kecamatan' });
    }
  }
  RefKecamatan.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    id_kabupaten: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefKecamatan',
    tableName: 'ref_kecamatan'
  });
  return RefKecamatan;
};