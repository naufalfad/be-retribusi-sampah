'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengangkutan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pengangkutan.belongsTo(models.Objek, { foreignKey: 'id_objek' });
      Pengangkutan.belongsTo(models.PetugasLapangan, { foreignKey: 'id_petugas' });
      Pengangkutan.hasMany(models.PengangkutanDetail, { foreignKey: 'id_pengangkutan' });
    }
  }
  Pengangkutan.init({
    id_pengangkutan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_objek: DataTypes.INTEGER,
    id_petugas: DataTypes.INTEGER,
    tgl_pengangkutan: DataTypes.DATE,
    total_poin_transaksi: DataTypes.INTEGER,
    foto_bukti: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pengangkutan',
    tableName: 'dat_pengangkutan'
  });
  return Pengangkutan;
};