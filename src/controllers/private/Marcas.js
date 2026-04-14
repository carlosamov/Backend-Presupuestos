import sequelize from '../../config/sequelize.js';
import {Op} from 'sequelize';
import {Marca} from '../../models/index.js';
import Response from '../../utils/Response.js';

export default {
  AddBrand: async (req, res) => {
    //Para insertar una marca
    const t = await sequelize.transaction();
    try {
      const brand = {
        nombre: req.body.nombre,
      };

      //Verificacion si el nombre de la marca ya existe en eliminados
      const deletedBrand = await Marca.findOne({where: {nombre: brand.nombre, deletedAt: {[Op.ne]: null}}, paranoid: false});
      if (deletedBrand) {
        await deletedBrand.restore({transaction: t});
        await t.commit();
        console.log('Marca restaurada exitosamente:');
        return res.status(200).json(Response.success(201, 'Marca restaurada exitosamente', deletedBrand));
      }

      const entry = await Marca.create(brand, {transaction: t});
      await t.commit();
      console.log('Marca creada exitosamente:');
      return res.status(201).json(Response.success(201, 'Marca creada exitosamente', entry));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Marca ya existente', null));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', null));
      }
      console.log('Error al crear la marca:', err);
      return res.status(500).json(Response.error(500, 'Error al crear la marca', err));
    }
  },

  GetAllBrands: async (req, res) => {
    //Para obtener todas las marcas
    try {
      const brands = await Marca.findAll({
        order: [['nombre', 'ASC']],
        attributes: ['marcaID', 'nombre'],
      });
      console.log('Marcas obtenidas exitosamente');
      return res.status(200).json(Response.success(200, 'Marcas obtenidas exitosamente', brands));
    } catch (err) {
      console.log('Error al obtener las marcas:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener las marcas', err));
    }
  },

  GetBrand: async (req, res) => {
    //Obtener una marca en especifico
    try {
      const brand = await Marca.findByPk(req.params.id, {attributes: ['id', 'nombre']});
      if (!brand) {
        console.log('Marca no encontrada');
        return res.status(404).json(Response.error(404, 'Marca no encontrada'));
      }

      console.log('Marca obtenida exitosamente');
      return res.status(200).json(Response.success(200, 'Marca obtenida exitosamente', brand));
    } catch (err) {
      console.log('Error al obtener la marca:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener la marca', err));
    }
  },

  UpdateBrand: async (req, res) => {
    //Actualizar una marca
    const t = await sequelize.transaction();
    try {
      const {nombre, marcaID} = req.body;
      const brand = await Marca.findByPk(marcaID);
      if (!brand) {
        console.log('Marca no encontrada');
        return res.status(404).json(Response.error(404, 'Marca no encontrada'));
      }
      brand.nombre = nombre;
      await brand.save({transaction: t});
      await t.commit();
      console.log('Marca actualizada exitosamente');
      return res.status(200).json(Response.success(200, 'Marca actualizada exitosamente', brand));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al actualizar la marca:', err);
      return res.status(500).json(Response.error(500, 'Error al actualizar la marca', err));
    }
  },

  DeleteBrand: async (req, res) => {
    //Eliminar una marca
    const t = await sequelize.transaction();
    try {
      const brand = await Marca.findByPk(req.params.id);
      if (!brand) {
        console.log('Marca no encontrada');
        return res.status(404).json(Response.error(404, 'Marca no encontrada'));
      }

      await brand.destroy({transaction: t});
      await t.commit();
      console.log('Marca eliminada exitosamente');
      return res.status(200).json(Response.success(200, 'Marca eliminada exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al eliminar la marca:', err);
      return res.status(500).json(Response.error(500, 'Error al eliminar la marca', err));
    }
  },
};
