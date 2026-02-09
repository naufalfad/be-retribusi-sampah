'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefPelayananSkrd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RefPelayananSkrd.belongsTo(models.Skrd, { foreignKey: 'id_skrd', as: 'skrd' });
      RefPelayananSkrd.belongsTo(models.RefPelayanan, { foreignKey: 'id_pelayanan' });
    }
  }
  RefPelayananSkrd.init({
    id_skrd: DataTypes.INTEGER,
    id_pelayanan: DataTypes.INTEGER,
    nama_pelayanan: DataTypes.STRING,
    tarif_pelayanan: DataTypes.DECIMAL,
    volume: DataTypes.DECIMAL,
    sub_total: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'RefPelayananSkrd',
    tableName: 'ref_pelayanan_skrd'
  });
  return RefPelayananSkrd;
};