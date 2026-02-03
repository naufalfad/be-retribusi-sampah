'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FormSurat extends Model {
    static associate(models) {
      // define association here
    }
  }
  FormSurat.init({
    id_form: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama_pemda: DataTypes.STRING,
    dinas_pelaksana: DataTypes.STRING,
    alamat_pemda: DataTypes.STRING,
    nama_pejabat: DataTypes.STRING,
    nip_pejabat: DataTypes.STRING,
    jabatan_pejabat: DataTypes.STRING,
    format_skrd: DataTypes.STRING,
    format_ssrd: DataTypes.STRING,
    logo: DataTypes.STRING,
    ttd_pejabat: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FormSurat',
    tableName: 'ref_form'
  });
  return FormSurat;
};