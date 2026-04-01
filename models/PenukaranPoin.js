'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PenukaranPoin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PenukaranPoin.belongsTo(models.Objek, { foreignKey: 'id_objek' });
      PenukaranPoin.belongsTo(models.Skrd, { foreignKey: 'id_skrd' });
    }
  }
  PenukaranPoin.init({
    id_penukaran: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_objek: DataTypes.INTEGER,
    id_skrd: DataTypes.INTEGER,
    jumlah_poin: DataTypes.INTEGER,
    nilai_rupiah: DataTypes.DECIMAL,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PenukaranPoin',
    tableName: 'dat_penukaran_poin'
  });
  return PenukaranPoin;
};