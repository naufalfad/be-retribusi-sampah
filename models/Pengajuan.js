'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengajuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pengajuan.belongsTo(models.Objek, { foreignKey: 'id_objek' });
      Pengajuan.belongsTo(models.Subjek, { foreignKey: 'id_subjek' });
    }
  }
  Pengajuan.init({
    id_pengajuan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_objek: DataTypes.INTEGER,
    id_subjek: DataTypes.INTEGER,
    jenis_pengajuan: {
      type: DataTypes.ENUM('Perubahan Data', 'Penonaktifan'),
    },
    data_lama: DataTypes.JSONB,
    data_baru: DataTypes.JSONB,
    alasan: DataTypes.TEXT,
    file_pendukung: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('Pending', 'Disetujui', 'Ditolak'),
      defaultValue: 'Pending'
    },
    catatan_dinas: DataTypes.TEXT,
    id_staff: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pengajuan',
    tableName: 'dat_pengajuan'
  });
  return Pengajuan;
};