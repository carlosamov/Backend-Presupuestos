import sequelize from '../../config/sequelize.js';
import {Producto} from '../../models/index.js';
import {Marca} from '../../models/index.js';
import {Categoria} from '../../models/index.js';
import Response from '../../utils/Response.js';

export default {
  AddProduct: async (req, res) => {
    //Para insertar un producto
    const t = await sequelize.transaction();
    try {
      const {marcaID, categoriaID} = req.body;
      if (marcaID) {
        const marca = await Marca.findByPk(marcaID);
        if (!marca) {
          console.log('Marca no encontrada');
          return res.status(404).json(Response.error(404, 'Marca no encontrada'));
        }
      }
      if (categoriaID) {
        const categoria = await Categoria.findByPk(categoriaID);
        if (!categoria) {
          console.log('Categoría no encontrada');
          return res.status(404).json(Response.error(404, 'Categoría no encontrada'));
        }
      }

      const newProduct = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        modelo: req.body.modelo || null,
        enlace: req.body.enlace || null,
        numeroParte: req.body.numeroParte || null,
        precio: req.body.precio || null,
      };

      const modeloChecker = await Producto.findOne({
        where: {modelo: newProduct.modelo},
        paranoid: false,
        attributes: ['productoID', 'nombre', 'modelo', 'descripcion', 'enlace', 'numeroParte', 'precio'],
        include: [
          {model: Marca, as: 'Marca', attributes: ['marcaID', 'nombre']},
          {model: Categoria, as: 'Categoria', attributes: ['categoriaID', 'nombre']},
        ],
      });
      if (modeloChecker) {
        if (!modeloChecker.deletedAt) {
          return res.status(409).json(Response.error(409, 'El producto ya existe', modeloChecker));
        }
        await modeloChecker.restore({transaction: t, user: req.user});
        await modeloChecker.update({...newProduct}, {transaction: t, user: req.user});
        if (marcaID) await modeloChecker.setMarca(marcaID, {transaction: t});
        if (categoriaID) await modeloChecker.setCategoria(categoriaID, {transaction: t});
        await t.commit();
        console.log('Producto restaurado exitosamente');
        return res.status(200).json(Response.success(200, 'Producto restaurado exitosamente', modeloChecker));
      }

      const createdProduct = await Producto.create(newProduct, {transaction: t, user: req.user});
      if (marcaID) await createdProduct.setMarca(marcaID, {transaction: t});
      if (categoriaID) await createdProduct.setCategoria(categoriaID, {transaction: t});
      await t.commit();
      const finalProduct = await Producto.findByPk(createdProduct.productoID, {
        attributes: ['productoID', 'nombre', 'modelo', 'descripcion', 'enlace', 'numeroParte', 'precio'],
        include: [
          {model: Marca, as: 'Marca', attributes: ['marcaID', 'nombre']},
          {model: Categoria, as: 'Categoria', attributes: ['categoriaID', 'nombre']},
        ],
      });
      console.log('Producto creado exitosamente');
      return res.status(201).json(Response.success(201, 'Producto creado exitosamente', finalProduct));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      }
      if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al crear el producto:', err);
      return res.status(500).json(Response.error(500, 'Error al crear el producto', err));
    }
  },

  GetAllProducts: async (req, res) => {
    //Para obtener todos los productos
    try {
      const products = await Producto.findAll({
        include: [
          {
            model: Marca,
            as: 'Marca',
            attributes: ['marcaID', 'nombre'],
          },
          {model: Categoria, as: 'Categoria', attributes: ['categoriaID', 'nombre']},
        ],
        attributes: ['productoID', 'nombre', 'modelo', 'descripcion', 'enlace', 'numeroParte', 'precio'],
      });
      console.log('Productos obtenidos exitosamente');
      return res.status(200).json(Response.success(200, 'Productos obtenidos existosamente', products));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      }
      if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener los productos:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener los productos', err));
    }
  },

  GetProduct: async (req, res) => {
    //Obtener un producto en especifico
    try {
      const product = await Producto.findByPk(req.params.id, {
        include: [
          {
            model: Marca,
            attributes: ['marcaID', 'nombre'],
          },
        ],
      });
      if (!product) {
        console.log('Producto no encontrado');
        return res.status(404).json(Response.error(404, 'Producto no encontrado'));
      }
      console.log('Producto obtenido exitosamente');
      return res.status(200).json(Response.success(200, 'Producto obtenido exitosamente', product));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      }
      if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener el producto:', err);
      return res.status(500).json(Response.error(500, 'Error al obtener el producto', err));
    }
  },

  UpdateProduct: async (req, res) => {
    //Modificar un producto en especifico
    const t = await sequelize.transaction();
    try {
      console.log(req.body);
      const product = await Producto.findByPk(req.body.productoID);
      if (!product) {
        console.log('Producto no encontrado');
        return res.status(404).json(Response.error(404, 'Producto no encontrado'));
      }

      const updatedProduct = {
        nombre: req.body.nombre,
        modelo: req.body.modelo,
        precio: req.body.precio,
        descripcion: req.body.descripcion,
        numeroParte: req.body.numeroParte,
        enlace: req.body.enlace,
      };

      await product.update(updatedProduct, {transaction: t, user: req.user});
      await t.commit();
      const updated = await Producto.findByPk(product.productoID, {
        attributes: ['productoID', 'nombre', 'modelo', 'descripcion', 'enlace', 'numeroParte', 'precio'],
        include: [
          {
            model: Marca,
            as: 'Marca',
            attributes: ['marcaID', 'nombre'],
          },
          {
            model: Categoria,
            as: 'Categoria',
            attributes: ['categoriaID', 'nombre'],
          },
        ],
      });
      console.log('Producto modificado exitosamente');
      return res.status(200).json(Response.success(200, 'Producto modificado correctamente', updated));
    } catch (err) {
      await t.rollback();

      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      }
      if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al modificar el producto:', err);
      return res.status(500).json(Response.error(500, 'Error al modificar el producto', err));
    }
  },

  DeleteProduct: async (req, res) => {
    //Eliminar un producto
    const t = await sequelize.transaction();
    try {
      const product = await Producto.findByPk(req.params.id);
      if (!product) {
        console.log('Producto no encontrado');
        return res.status(404).json(Response.error(404, 'Producto no encontrado'));
      }

      await product.destroy({transaction: t, user: req.user});
      await t.commit();
      console.log('Producto eliminado correctamente');
      return res.status(200).json(Response.success(200, 'Producto eliminado correctamente', product));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      }
      if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al eliminar el producto:', err);
      return res.status(500).json(Response.error(500, 'Error al eliminar el producto', err));
    }
  },
};
