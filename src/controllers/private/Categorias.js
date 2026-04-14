import sequelize from '../../config/sequelize.js';
import {Op} from 'sequelize';
import {Categoria} from '../../models/index.js';
import Response from '../../utils/Response.js';

export default {
  AddCategory: async (req, res) => {
    //Para insertar una categoria
    const t = await sequelize.transaction();
    try {
      const category = {
        nombre: req.body.nombre,
      };

      //Verificacion si el nombre de la categoria ya existe en eliminados
      const deletedCategory = await Categoria.findOne({where: {nombre: category.nombre, deletedAt: {[Op.ne]: null}}, paranoid: false});
      if (deletedCategory) {
        await deletedCategory.restore({transaction: t});
        await t.commit();
        console.log('Categoría restaurada exitosamente');
        return res.status(200).json(Response.success(201, 'Categoria restaurada exitosamente', deletedCategory));
      }

      const entry = await Categoria.create(category, {transaction: t});
      await t.commit();
      console.log('Categoría creada exitosamente');
      return res.status(201).json(Response.success(201, 'Categoria creada exitosamente', entry));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Categoria ya existente', null));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', null));
      }
      console.log('Error al crear la categoria:', err);
      return res.status(500).json(Response.error(500, 'Error al crear la categoria', err));
    }
  },

  GetAllCategories: async (req, res) => {
    //Para obtener todas las categorias
    try {
      const categories = await Categoria.findAll({
        order: [['nombre', 'ASC']],
        attributes: ['categoriaID', 'nombre'],
      });
      console.log('Categorias obtenidas exitosamente');
      res.status(200).json(Response.success(200, 'Categorias obtenidas exitosamente', categories));
    } catch (err) {
      console.log('Error al obtener las categorias:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener las categorias', err));
    }
  },

  GetCategory: async (req, res) => {
    //Obtener una categoria en especifico
    try {
      const category = await Categoria.findByPk(req.params.id, {attributes: ['id', 'nombre']});
      if (!category) {
        console.log('Categoria no encontrada');
        return res.status(404).json(Response.error(404, 'Categoria no encontrada'));
      }

      console.log('Categoria obtenida exitosamente');
      return res.status(200).json(Response.success(200, 'Categoria obtenida exitosamente', category));
    } catch (err) {
      console.log('Error al obtener la categoria:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener la categoria', err));
    }
  },

  UpdateCategory: async (req, res) => {
    //Actualizar una categoria
    const t = await sequelize.transaction();
    try {
      const {nombre, categoriaID} = req.body;
      if (!nombre || !categoriaID) return res.status(400).json(Response.error(400, 'Faltan datos obligatorios'));
      const category = await Categoria.findByPk(categoriaID);
      if (!category) return res.status(404).json(Response.error(404, 'Categoria no encontrada'));
      category.nombre = nombre;
      await category.save({transaction: t});
      await t.commit();
      console.log('Categoria actualizada exitosamente');
      return res.status(200).json(Response.success(200, 'Categoria actualizada exitosamente', category));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al actualizar la categoria:', err);
      return res.status(500).json(Response.error(500, 'Error al actualizar la categoria', err));
    }
  },

  DeleteCategory: async (req, res) => {
    //Eliminar una categoria
    const t = await sequelize.transaction();
    try {
      const category = await Categoria.findByPk(req.params.id);
      if (!category) {
        console.log('Categoria no encontrada');
        return res.status(404).json(Response.error(404, 'Categoria no encontrada'));
      }
      await category.destroy({transaction: t});
      await t.commit();
      console.log('Categoria eliminada exitosamente');
      return res.status(200).json(Response.success(200, 'Categoria eliminada exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al eliminar la categoria:', err);
      return res.status(500).json(Response.error(500, 'Error al eliminar la categoria', err));
    }
  },
};
