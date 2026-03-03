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
    name: DataTypes.STRING,
    kode_pos: DataTypes.STRING,
    lokasi: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'RefKelurahan',
    tableName: 'ref_kelurahan'
  });
  return RefKelurahan;
};