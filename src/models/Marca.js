import {DataTypes, Model} from 'sequelize';
import sequelize from '../config/sequelize.js';

class Marca extends Model {}

Marca.init(
  {
    marcaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {msg: 'El nombre de la marca no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El nombre de la marca solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El nombre de la marca debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'Marca',
    tableName: 'Marcas',
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

export default Marca;
