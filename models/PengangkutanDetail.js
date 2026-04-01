'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PengangkutanDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PengangkutanDetail.belongsTo(models.Pengangkutan, { foreignKey: 'id_pengangkutan' });
      PengangkutanDetail.belongsTo(models.RefKategoriSampah, { foreignKey: 'id_kategori' });
    }
  }
  PengangkutanDetail.init({
    id_detail: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_pengangkutan: DataTypes.INTEGER,
    id_kategori: DataTypes.INTEGER,
    volume: DataTypes.DECIMAL,
    subtotal_poin_transaksi: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PengangkutanDetail',
    tableName: 'dat_pengangkutan_detail'
  });
  return PengangkutanDetail;
};