import {DataTypes, Model} from 'sequelize';
import sequelize from '../config/sequelize.js';

class Producto extends Model {}

//Nombre - Obligatorio
//Descripción - Obligatorio
//Modelo - Obligatorio y único
//Enlace - Opcional
//Precio - Opcional
//Numero de Parte - Opcional
//Llave foranea Marca - Opcional
//Llave foranea Categoria - Opcional
Producto.init(
  {
    productoID: {
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
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El nombre solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El nombre debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {msg: 'La descripción es obligatoria'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El nombre solo puede contener letras, números y signos de puntuación ',
        },
        notEmpty: {msg: 'La descripción no puede estar vacía'},
        len: {args: [1, 500], msg: 'La descripción debe tener entre 1 y 500 caracteres'}, // Longitud máxima de 500 caracteres
      },
    },
    modelo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El modelo solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El modelo debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },
    enlace: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {msg: 'El enlace debe ser una URL válida'},
      }, // Validación de URL válida
    },
    precio: {
      type: DataTypes.DOUBLE(10, 2), // Permite hasta 10 dígitos en total y 2 decimales
      allowNull: true,
      validate: {
        isDecimal: {msg: 'El precio debe ser un número decimal válido'},
        min: {args: [0], msg: 'El precio debe ser mayor o igual a cero'},
      },
      defaultValue: 0.0,
    },
    numeroParte: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El número de parte solo puede contener letras, números y guiones',
        },
        len: {args: [1, 100], msg: 'El número de parte debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },
    //Llaves foranea
    marcaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    categoriaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'Producto',
    tableName: 'Productos',
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

export default Producto;
