'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefPelayanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefPelayanan.belongsTo(models.Kelas, { foreignKey: 'id_kelas', as: 'kelas' });
      RefPelayanan.hasMany(models.RefPelayananSkrd, { foreignKey: 'id_pelayanan' });
    }
  }
  RefPelayanan.init({
    id_pelayanan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_kelas: DataTypes.INTEGER,
    nama_pelayanan: DataTypes.STRING,
    tarif_pelayanan: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'RefPelayanan',
    tableName: 'ref_pelayanan'
  });
  return RefPelayanan;
};