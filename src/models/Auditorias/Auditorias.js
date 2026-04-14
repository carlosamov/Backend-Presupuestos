import {Model, DataTypes} from 'sequelize';
import sequelize from '../../config/sequelize.js';

import AccionAuditoria from '../../utils/AccionAuditoria.js';
import EntidadAuditoria from '../../utils/EntidadAuditoria.js';

class Auditorias extends Model {}

Auditorias.init(
  {
    auditoriaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    usuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    entidad: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'La entidad es obligatoria'},
        isIn: {
          args: [EntidadAuditoria.getAllRoles()],
          msg: `La entidad debe ser una de las siguientes: ${EntidadAuditoria.getAllRoles().join(', ')}`,
        },
      },
    },

    entidadID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {msg: 'El ID de la entidad es obligatorio'},
        isInt: {msg: 'El ID de la entidad debe ser un número entero'},
      },
    },

    accion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'La acción es obligatoria'},
        isIn: {
          args: [AccionAuditoria.getAllRoles()],
          msg: `La acción debe ser una de las siguientes: ${AccionAuditoria.getAllRoles().join(', ')}`,
        },
      },
    },

    estadoAnterior: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    estadoNuevo: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'Auditorias',
    tableName: 'Auditorias',
    timestamps: true,
  }
);

export default Auditorias;
