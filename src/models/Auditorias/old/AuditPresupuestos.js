const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../config/sequelize');

class AuditPresupuestos extends Model {}

AuditPresupuestos.init(
  {
    auditoriaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    presupuestoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'AuditPresupuestos',
    tableName: 'AuditPresupuestos',
    timestamps: true,
  }
);

module.exports = AuditPresupuestos;
