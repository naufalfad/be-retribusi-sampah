'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ssrd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Ssrd.belongsTo(models.Skrd, { foreignKey: 'id_skrd' });
    }
  }
  Ssrd.init({
    id_ssrd: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_skrd: DataTypes.INTEGER,
    no_ssrd: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    amount_paid: DataTypes.DECIMAL,
    paid_at: DataTypes.DATE,
    payment_status: DataTypes.STRING,
    rejected_reason: DataTypes.STRING,
    catatan_bendahara: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Ssrd',
    tableName: 'dat_ssrd'
  });
  return Ssrd;
};