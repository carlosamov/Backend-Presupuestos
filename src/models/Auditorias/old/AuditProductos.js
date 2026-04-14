const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../config/sequelize');

class AuditProductos extends Model {}

AuditProductos.init(
  {
    auditoriaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    productoID: {
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
    modelName: 'AuditProductos',
    tableName: 'AuditProductos',
    timestamps: true,
  }
);

module.exports = AuditProductos;
