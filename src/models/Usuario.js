import {DataTypes, Model} from 'sequelize';
import Rol from '../utils/Rol.js';
import sequelize from '../config/sequelize.js';

class Usuario extends Model {}

Usuario.init(
  {
    usuarioID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'El nombre es obligatorio'},
        notEmpty: {msg: 'El nombre no puede estar vacío'},
        is: {
          args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
          msg: 'El nombre solo puede contener letras, espacios, apóstrofes y guiones',
        },
        len: {args: [3, 100], msg: 'El nombre debe tener entre 3 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    loginNombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {msg: 'El nombre de usuario es obligatorio'},
        notEmpty: {msg: 'El nombre de usuario no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones',
        },
        len: {args: [4, 50], msg: 'El nombre de usuario debe tener entre 4 y 50 caracteres'}, // Longitud máxima de 50 caracteres
      },
    },

    clave: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'La clave es obligatoria'},
        notEmpty: {msg: 'La clave no puede estar vacía'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'La clave debe tener al menos 6 caracteres alfanuméricos',
        },
        min: {
          args: 6,
          msg: 'La clave debe tener al menos 6 caracteres alfanuméricos',
        },
      },
    },

    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'El rol es obligatorio'},
        notEmpty: {msg: 'El rol no puede estar vacío'},
        isIn: {
          args: [Rol.getAllRoles()],
          msg: 'El rol debe ser SUPERADMIN, ADMIN o USER',
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps: true,
  }
);

export default Usuario;
