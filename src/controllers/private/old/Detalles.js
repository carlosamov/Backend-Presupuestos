const sequelize = require('../../../config/sequelize');
const DetallesModel = require('../../../models/Detalle');
const Response = require('../../../utils/Response');

//Modelos auxiliares
const ProductosModel = require('../../../models/Producto');
const PresupuestosModel = require('../../../models/Presupuesto');
const MarcasModel = require('../../../models/Marca');
const CategoriasModel = require('../../../models/Categoria');

module.exports = {
  AddDetail: async (req, res) => {
    //Para insertar un detalle

    const presupuesto = await PresupuestosModel.findByPk(req.body.PresupuestoID);
    if (!presupuesto) {
      console.log('Presupuesto no encontrado');
      return res.status(404).json(Response.error(404, 'Presupuesto no encontrado'));
    }

    const producto = await ProductosModel.findByPk(req.body.ProductoID);
    if (!producto) {
      console.log('Producto no encontrado');
      return res.status(404).json(Response.error(404, 'Producto no encontrado'));
    }

    const t = await sequelize.transaction();

    try {
      const data = {
        cantidad: req.body.cantidad,
        costoUnitario: producto.precio,
        traidaUnitariaPorcentaje: req.body.traida,
        gananciaUnitariaPorcentaje: req.body.ganancia,
      };
      const detalle = await DetallesModel.create(data, {transaction: t});

      await detalle.setPresupuesto(presupuesto, {transaction: t});
      await detalle.setProducto(producto, {transaction: t});
      await t.commit();
      console.log('Detalle creado exitosamente');
      return res.status(201).json(Response.success(201, 'Detalle creado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al crear el detalle:', err);
      return res.status(500).json(Response.error(500, 'Error al crear el detalle', err));
    }
  },

  GetDetailsByBudgetID: async (req, res) => {
    //Obtener todos los detalles de un presupuesto
    try {
      //Validar que el presupuesto y el detalle existan
      const presupuesto = await PresupuestosModel.findByPk(req.params.id);
      if (!presupuesto) {
        console.log('Presupuesto no encontrado');
        return res.status(404).json(Response.error(404, 'Presupuesto no encontrado'));
      }

      const detalles = presupuesto.getDetalles({
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: ProductosModel,
            include: [{model: CategoriasModel}, {model: MarcasModel}],
          },
        ],
      });
      if (!detalles) {
        console.log('No se encontraron detalles');
        return res.status(200).json(Response.success(200, 'No se encontraron detalles', []));
      }

      const data = detalles.map((detalle) => {
        return {
          detalleID: detalle.detalleID,
          cantidad: detalle.cantidad,
          costoUnitario: detalle.costoUnitario,
          traidaUnitariaPorcentaje: detalle.traidaUnitariaPorcentaje,
          gananciaUnitariaPorcentaje: detalle.gananciaUnitariaPorcentaje,

          //Relaciones
          producto: detalle.Producto,

          //Calculos
          calculos: detalle.RealizarCalculos(),
        };
      });
      console.log('Detalles obtenidos exitosamente');
      return res.status(200).json(Response.success(200, 'Detalles obtenidos exitosamente', data));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener los detalles:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener los detalles', err));
    }
  },

  UpdateDetail: async (req, res) => {
    //Modificar un detalle en especifico

    const t = await sequelize.transaction();

    try {
      //Validar que los IDs existan
      const detalle = await DetallesModel.findByPk(req.body.detalleId);
      if (!detalle) {
        console.log('Detalle no encontrado');
        return res.status(404).json(Response.error(404, 'Detalle no encontrado'));
      }

      const producto = await ProductosModel.findByPk(req.body.productoID);
      if (!producto) {
        console.log('Producto no encontrado');
        return res.status(404).json(Response.error(404, 'Producto no encontrado'));
      }

      //Objeto que modifica el detalle
      const data = {
        cantidad: req.body.cantidad,
        precioUnitario: req.body.precioUnitario,
        traida: req.body.traida,
        ganancia: req.body.ganancia,
      };

      //Preparando y ejecutando la transacción
      await detalle.update(data, {transaction: t, user: req.user});
      await detalle.setProducto(producto, {transaction: t});
      await t.commit();
      console.log('Detalle modificado exitosamente');
      return res.status(200).json(Response.success(200, 'Detalle modificado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al modificar el detalle:', err);
      return res.status(500).json(Response.error(500, 'Error al modificar el detalle', err));
    }
  },

  DeleteDetail: async (req, res) => {
    //Eliminar un detalle
    const t = await sequelize.transaction();
    try {
      const detalle = await DetallesModel.findByPk(req.params.id);
      if (!detalle) {
        console.log('Detalle no encontrado');
        return res.status(404).json(Response.error(404, 'Detalle no encontrado'));
      }

      await detalle.destroy({transaction: t, user: req.user});
      await t.commit();
      console.log('Detalle eliminado exitosamente');
      return res.status(200).json(Response.success(200, 'Detalle eliminado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al eliminar el detalle:', err);
      return res.status(500).json(Response.error(500, 'Error al eliminar el detalle', err));
    }
  },
};
