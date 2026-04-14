const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../config/sequelize');
const Detalle = require('../Detalle');

class AuditDetalles extends Model {}

AuditDetalles.init(
  {
    auditoriaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    detalleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripción: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'AuditDetalles',
    tableName: 'AuditDetalles',
    timestamps: true,
  }
);

module.exports = AuditDetalles;
