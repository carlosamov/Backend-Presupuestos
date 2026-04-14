import sequelize from '../../config/sequelize.js';
import Rol from '../../utils/Rol.js';
import {Presupuesto} from '../../models/index.js';
import {Detalle} from '../../models/index.js';
import Response from '../../utils/Response.js';

export default {
  AddBudget: async (req, res) => {
    //Para insertar un presupuesto (cabecera)
    const t = await sequelize.transaction();
    if (!req.user.rol) {
      console.log('Rol de usuario no definido');
      return res.status(400).json(Response.error(400, 'Rol de usuario no definido'));
    }

    try {
      const newBudget = {
        nombrePresupuesto: req.body.nombrePresupuesto,
        //Informacion del cliente
        nombreEmpresa: req.body.nombreEmpresa,
        direccionEmpresa: req.body.direccionEmpresa,
        ciudadEmpresa: req.body.ciudadEmpresa,
        representanteEmpresa: req.body.representanteEmpresa,
        //Informacion del presupuesto
        fecha: req.body.fecha,
        asunto: req.body.asunto,
        solucion: req.body.solucion,
        version: req.body.version,
        presupuesto: req.body.presupuesto,
        //Pie de pagina
        notasTiempoEntrega: req.body.notasTiempoEntrega,
        notasGarantias: req.body.notasGarantias,
        notas: req.body.notas,
        incoterm: req.body.incoterm,
        formaPago: req.body.formaPago,
        anticipo: req.body.anticipo,
        tiempoInstalacion: req.body.tiempoInstalacion,
        tiempoEntrega: req.body.tiempoEntrega,
        lugarEntrega: req.body.lugarEntrega,
        //Rol del usuario que crea el presupuesto
        rol: req.user.rol,
      };

      const createdBudget = await Presupuesto.create(newBudget, {transaction: t, user: req.user});
      await t.commit();
      console.log('Presupuesto creado exitosamente');
      return res.status(201).json(Response.success(201, 'Presupuesto creado exitosamente', createdBudget));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al crear el presupuesto:', err);
      return res.status(500).json(Response.error(500, 'Error al crear el presupuesto', err));
    }
  },

  CloneBudget: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const budget = await Presupuesto.findByPk(req.params.id);
      if (!budget) {
        console.log('Presupuesto no encontrado');
        return res.status(404).json(Response.error(404, 'Presupuesto no encontrado'));
      }
      const usuarioRol = req.user.rol;
      const presupuestoRol = budget.rol;
      if (usuarioRol === Rol.USER && (presupuestoRol == Rol.ADMIN || presupuestoRol == Rol.SUPERADMIN)) {
        console.log('No tienes permisos para clonar este presupuesto');
        return res.status(403).json(Response.error(403, 'No tienes permisos para clonar este presupuesto'));
      }

      //Clonacion de presupuesto
      const budgetClone = {
        nombrePresupuesto: 'Copia de ' + budget.nombrePresupuesto,

        nombreEmpresa: budget.nombreEmpresa,
        direccionEmpresa: budget.direccionEmpresa,
        ciudadEmpresa: budget.ciudadEmpresa,
        representanteEmpresa: budget.representanteEmpresa,

        fecha: budget.fecha,
        asunto: budget.asunto,
        solucion: budget.solucion,
        version: budget.version,
        presupuesto: budget.presupuesto,

        notasTiempoEntrega: budget.notasTiempoEntrega,
        notasGarantias: budget.notasGarantias,
        notas: budget.notas,
        incoterm: budget.incoterm,
        formaPago: budget.formaPago,
        anticipo: budget.anticipo,
        tiempoInstalacion: budget.tiempoInstalacion,
        tiempoEntrega: budget.tiempoEntrega,
        lugarEntrega: budget.lugarEntrega,

        rol: budget.rol,
      };
      const clonedEntry = await Presupuesto.create(budgetClone, {transaction: t, user: req.user});

      //Clonacion de detalles
      const details = await budget.getDetalles();
      const detailsClone = details.map((detail) => {
        return {
          cantidad: detail.cantidad,
          costoUnitario: detail.costoUnitario,
          traidaUnitariaPorcentaje: detail.traidaUnitariaPorcentaje,
          gananciaUnitariaPorcentaje: detail.gananciaUnitariaPorcentaje,
          productoID: detail.productoID,
          presupuestoID: clonedEntry.presupuestoID, // Asignar el nuevo presupuestoID
        };
      });
      await Detalle.bulkCreate(detailsClone, {transaction: t});
      await t.commit();
      console.log('Presupuesto clonado exitosamente');
      return res.status(200).json(Response.success(200, 'Presupuesto clonado exitosamente', clonedEntry));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al clonar el presupuesto:', err);
      return res.status(500).json(Response.error(500, 'Error al clonar el presupuesto', err));
    }
  },

  GetAllBudgets: async (req, res) => {
    //Para obtener todos los presupuestos
    try {
      let budgets = [];
      if (req.user.rol == Rol.SUPERADMIN || req.user.rol == Rol.ADMIN) budgets = await Presupuesto.findAll();
      else if (req.user.rol == Rol.USER) {
        budgets = await Presupuesto.findAll({
          where: {rol: Rol.USER},
        });
      }

      console.log('Presupuestos obtenidos exitosamente');
      return res.status(200).json(Response.success(200, 'Presupuestos obtenidos exitosamente', budgets));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener los presupuestos:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener los presupuestos', err));
    }
  },

  GetBudget: async (req, res) => {
    //Obtener un presupuesto en especifico
    try {
      //Obtener un presupuesto en especifico
      const budget = await Presupuesto.findByPk(req.params.id, {
        include: [{model: Detalle, as: 'Detalles'}],
        attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
      });
      if (!budget) {
        console.log('Presupuesto no encontrado');
        return res.status(404).json(Response.error(404, 'Presupuesto no encontrado'));
      }

      console.log('Presupuesto obtenido exitosamente');
      return res.status(200).json(Response.success(200, 'Presupuesto obtenido exitosamente', budget));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener el presupuesto:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener el presupuesto', err));
    }
  },

  UpdateBudget: async (req, res) => {
    //Modificar un presupuesto en especifico
    const t = await sequelize.transaction();
    try {
      const budget = await Presupuesto.findByPk(req.body.presupuestoID);
      if (!budget) {
        console.log('Presupuesto no encontrado');
        return res.status(404).json(Response.error(404, 'Presupuesto no encontrado'));
      }
      const usuarioRol = req.user.rol;
      const presupuestoRol = budget.rol;
      if (usuarioRol === Rol.USER && (presupuestoRol == Rol.ADMIN || presupuestoRol == Rol.SUPERADMIN)) {
        console.log('No tienes permisos para modificar este presupuesto');
        return res.status(403).json(Response.error(403, 'No tienes permisos para modificar este presupuesto'));
      }

      //Actualizar los campos del presupuesto
      budget.empresa = req.body.empresa || budget.empresa;
      budget.direccion = req.body.direccion || budget.direccion;
      budget.ciudad = req.body.ciudad || budget.ciudad;
      budget.telefono = req.body.telefono || budget.telefono;
      budget.representante = req.body.representante || budget.representante;

      budget.fecha = req.body.fecha || budget.fecha;
      budget.asunto = req.body.asunto || budget.asunto;
      budget.solucion = req.body.solucion || budget.solucion;
      budget.version = req.body.version || budget.version;
      budget.presupuesto = req.body.presupuesto || budget.presupuesto;

      await budget.save({transaction: t, user: req.user});
      await t.commit();
      console.log('Presupuesto modificado exitosamente');
      return res.status(200).json(Response.success(200, 'Presupuesto modificado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al modificar el presupuesto:', err);
      return res.status(500).json(Response.error(500, 'Error al modificar el presupuesto', err));
    }
  },

  DeleteBudget: async (req, res) => {
    //Eliminar un presupuesto
    const t = await sequelize.transaction();
    try {
      const budget = await Presupuesto.findByPk(req.params.id);
      if (!budget) {
        console.log('Presupuesto no encontrado');
        return res.status(404).json(Response.error(404, 'Presupuesto no encontrado'));
      }
      const usuarioRol = req.user.rol;
      const presupuestoRol = budget.rol;
      if (usuarioRol === Rol.USER && (presupuestoRol == Rol.ADMIN || presupuestoRol == Rol.SUPERADMIN)) {
        console.log('No tienes permisos para eliminar este presupuesto');
        return res.status(403).json(Response.error(403, 'No tienes permisos para eliminar este presupuesto'));
      }

      await budget.destroy({transaction: t, user: req.user});
      await t.commit();
      console.log('Presupuesto eliminado exitosamente');
      return res.status(200).json(Response.success(200, 'Presupuesto eliminado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al eliminar el presupuesto:', err);
      return res.status(500).json(Response.error(500, 'Error al eliminar el presupuesto', err));
    }
  },
};
