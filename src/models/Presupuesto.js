import {DataTypes, Model} from 'sequelize';
import Rol from '../utils/Rol.js';
import sequelize from '../config/sequelize.js';
import Decimal from 'decimal.js';

class Presupuesto extends Model {
  async ObtenerCalculos() {
    const detalles = await this.getDetalles();
    let costoCantidad = new Decimal(0);
    let costoTraida = new Decimal(0);
    let gananciaTotal = new Decimal(0);
    let totalPresupuesto = new Decimal(0);

    for (const detalle of detalles) {
      const calculos = detalle.RealizarCalculos();

      costoCantidad = costoCantidad.add(calculos.costoCantidad);
      costoTraida = costoTraida.add(calculos.traidaCantidad);
      gananciaTotal = gananciaTotal.add(calculos.gananciaCantidad);
      totalPresupuesto = totalPresupuesto.add(calculos.totalDetalle);
    }

    const response = {
      costoCantidad,
      costoTraida,
      gananciaTotal,
      totalPresupuesto,
    };

    return response;
  }
}

Presupuesto.init(
  {
    presupuestoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombrePresupuesto: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {msg: 'El nombre del presupuesto no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El nombre del presupuesto solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El nombre del presupuesto debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    //Informacion del cliente
    nombreEmpresa: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'El nombre de la empresa es obligatorio'},
        notEmpty: {msg: 'El nombre de la empresa no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El nombre de la empresa solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El nombre de la empresa debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    direccionEmpresa: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'La dirección es obligatoria'},
        notEmpty: {msg: 'La dirección no puede estar vacía'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'La dirección de la empresa solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'La dirección debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    ciudadEmpresa: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'La ciudad es obligatoria'},
        notEmpty: {msg: 'La ciudad no puede estar vacía'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'La ciudad solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'La ciudad debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    representanteEmpresa: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {msg: 'El representante es obligatorio'},
        notEmpty: {msg: 'El representante no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El representante solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El representante debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    //Informacion del presupuesto
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {msg: 'La fecha debe ser una fecha válida'},
        notEmpty: {msg: 'La fecha no puede estar vacía'},
      },
    },

    asunto: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {msg: 'El asunto no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El asunto solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El asunto debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    solucion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {msg: 'La solución no puede estar vacía'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'La solución solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 500], msg: 'La solución debe tener entre 1 y 500 caracteres'}, // Longitud máxima de 500 caracteres
      },
    },

    version: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {msg: 'La versión no puede estar vacía'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'La versión solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'La versión debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    presupuesto: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {msg: 'El presupuesto no puede estar vacío'},
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El presupuesto solo puede contener letras, números y signos de puntuación',
        },
        len: {args: [1, 100], msg: 'El presupuesto debe tener entre 1 y 100 caracteres'}, // Longitud máxima de 100 caracteres
      },
    },

    //Informacion del final de pagina
    notasTiempoEntrega: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'Los tiempos de entrega solo pueden contener letras, números y signos de puntuación',
        },
      },
    },

    notasGarantias: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'Las notas de garantía solo pueden contener letras, números y signos de puntuación',
        },
      },
    },

    notas: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'Las notas solo pueden contener letras, números y signos de puntuación',
        },
      },
    },

    incoterm: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El incoterm solo puede contener letras, números y signos de puntuación',
        },
      },
    },

    formaPago: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'La forma de pago solo puede contener letras, números y signos de puntuación',
        },
      },
    },

    anticipo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El anticipo solo puede contener letras, números y signos de puntuación',
        },
      },
    },

    tiempoInstalacion: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El tiempo de instalación solo puede contener letras, números y signos de puntuación',
        },
      },
    },

    tiempoEntrega: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El tiempo de entrega solo puede contener letras, números y signos de puntuación',
        },
      },
    },

    lugarEntrega: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/,
          msg: 'El lugar de entrega solo puede contener letras, números y signos de puntuación',
        },
      },
    },

    //Rol de usuario que creó el presupuesto
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {msg: 'El rol no puede estar vacío'},
        notNull: {msg: 'El rol es obligatorio'},
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
    modelName: 'Presupuesto',
    tableName: 'Presupuestos',
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

export default Presupuesto;
