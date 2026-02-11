'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Objek extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Objek.belongsTo(models.Subjek, { foreignKey: 'id_subjek' });
      Objek.belongsTo(models.Kelas, { foreignKey: 'id_kelas', as: 'kelas' });
      Objek.hasMany(models.DokumenObjek, { foreignKey: 'id_objek' });
      Objek.hasMany(models.Skrd, { foreignKey: 'id_objek' });
    }
  }
  Objek.init({
    id_objek: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_subjek: DataTypes.INTEGER,
    id_kelas: DataTypes.INTEGER,
    kategori_objek: DataTypes.STRING,
    nama_objek: DataTypes.STRING,
    alamat_objek: DataTypes.STRING,
    rt_rw_objek: DataTypes.STRING,
    telepon_objek: DataTypes.STRING,
    provinsi_objek: DataTypes.STRING,
    kabupaten_objek: DataTypes.STRING,
    kecamatan_objek: DataTypes.STRING,
    kelurahan_objek: DataTypes.STRING,
    kode_pos_objek: DataTypes.STRING,
    koordinat_objek: {
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false
    },
    tarif_pokok_objek: DataTypes.DECIMAL,
    npor_objek: DataTypes.STRING,
    status_objek: DataTypes.ENUM('Aktif', 'Non-Aktif', 'Pending')
  }, {
    sequelize,
    modelName: 'Objek',
    tableName: 'dat_objek'
  });
  return Objek;
};