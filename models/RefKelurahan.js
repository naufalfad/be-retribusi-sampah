'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefKelurahan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefKelurahan.belongsTo(models.RefKecamatan, { foreignKey: 'id_kecamatan' });
      RefKelurahan.hasMany(models.RefKodepos, { foreignKey: 'id_kelurahan' });
    }
  }
  RefKelurahan.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    id_kecamatan: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RefKelurahan',
    tableName: 'ref_kelurahan'
  });
  return RefKelurahan;
};