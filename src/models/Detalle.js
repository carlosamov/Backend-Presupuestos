import {DataTypes, Model} from 'sequelize';
import sequelize from '../config/sequelize.js';
import Decimal from 'decimal.js';

class Detalle extends Model {
  RealizarCalculos() {
    // Utilizando Decimal.js para cálculos precisos
    const costoUnitario = new Decimal(this.costoUnitario);
    const gananciaUnitariaPorcentaje = new Decimal(this.gananciaUnitariaPorcentaje);
    const traidaUnitariaPorcentaje = new Decimal(this.traidaUnitariaPorcentaje);
    const cantidad = new Decimal(this.cantidad);

    // Tabla 2
    const gananciaUnitaria = costoUnitario.times(gananciaUnitariaPorcentaje);
    const traidaUnitaria = costoUnitario.plus(gananciaUnitaria).times(traidaUnitariaPorcentaje);

    // Tabla 1
    const precioUnitario = costoUnitario.plus(traidaUnitaria).plus(gananciaUnitaria); // P.V.P.
    const totalDetalle = precioUnitario.times(cantidad);

    // Tabla 3
    const costoCantidad = costoUnitario.times(cantidad);
    const traidaCantidad = traidaUnitaria.times(cantidad);
    const gananciaCantidad = gananciaUnitaria.times(cantidad);

    const response = {
      // Tabla 1
      precioUnitario: Number(precioUnitario.toFixed(2)),
      totalDetalle: Number(totalDetalle.toFixed(2)),
      // Tabla 2
      traidaUnitaria: Number(traidaUnitaria.toFixed(2)),
      gananciaUnitaria: Number(gananciaUnitaria.toFixed(2)),
      // Tabla 3
      costoCantidad: Number(costoCantidad.toFixed(2)),
      traidaCantidad: Number(traidaCantidad.toFixed(2)),
      gananciaCantidad: Number(gananciaCantidad.toFixed(2)),
    };
    return response;
  }
}

Detalle.init(
  {
    detalleID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    //informacion del detalle
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isInt: {msg: 'La cantidad debe ser un número entero'}, // Validar que sea un número entero
        min: {args: [1], msg: 'La cantidad debe ser mayor a cero'}, // No permitir cantidades negativas
      },
    },
    costoUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {msg: 'El precio unitario debe ser un número positivo'}, // Validar que sea un número decimal
        min: {args: [0], msg: 'El precio unitario debe ser mayor o igual a cero'}, // No permitir cantidades negativas
      },
    },
    traidaUnitariaPorcentaje: {
      // Porcentaje de traida (por ejemplo, 0.10 para 10%)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {msg: 'La traida debe ser un número positivo'}, // Validar que sea un número decimal
        min: {args: [0], msg: 'La traida debe ser mayor o igual a cero'}, // No permitir cantidades negativas
      },
    },
    gananciaUnitariaPorcentaje: {
      // Porcentaje de ganancia (por ejemplo, 0.20 para 20%)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {msg: 'La ganancia debe ser un número positivo'}, // Validar que sea un número decimal
        min: {args: [0], msg: 'La ganancia debe ser mayor o igual a cero'}, // No permitir cantidades negativas
      },
    },

    //llaves foraneas
    productoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    presupuestoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true, // Habilita el soft delete
    modelName: 'Detalle',
    tableName: 'Detalles',
    timestamps: true,
  }
);

export default Detalle;
