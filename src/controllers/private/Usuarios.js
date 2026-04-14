import sequelize from '../../config/sequelize.js';
import {Op} from 'sequelize';
import Usuario from '../../models/Usuario.js';
import Response from '../../utils/Response.js';

import bcrypt from 'bcrypt';
const saltRound = 10;

export default {
  CreateUser: async (req, res) => {
    //Para crear un usuario
    const t = await sequelize.transaction();
    try {
      const hashedClave = await bcrypt.hash(req.body.clave, saltRound);
      const newUser = {
        nombre: req.body.nombre,
        loginNombre: req.body.loginNombre,
        clave: hashedClave,
        rol: req.body.rol,
      };

      const loginNombreChecker = await Usuario.findOne({where: {loginNombre: newUser.loginNombre}, paranoid: false});
      const nombreChecker = await Usuario.findAll({where: {nombre: newUser.nombre}, paranoid: false});
      if (loginNombreChecker) {
        //loginNombre existe
        if (loginNombreChecker.deletedAt == null) {
          //loginNombre esta activo - Rechazar
          console.log('El nombre de login ya existe.');
          return res.status(409).json(Response.error(409, 'El nombre de login ya existe.'));
        }

        //loginNombre no esta activo
        if (nombreChecker.length > 0) {
          //algun nombre existe
          const activeNombre = nombreChecker.find((user) => user.deletedAt == null);
          if (activeNombre) {
            //algun nombre esta activo - Rechazar
            console.log('El nombre de usuario ya existe.');
            return res.status(409).json(Response.error(409, 'El nombre de usuario ya existe.'));
          }
        }
        //ningun nombre existe o todos estan inactivos - Restaurar
        loginNombreChecker.nombre = newUser.nombre;
        loginNombreChecker.clave = newUser.clave;
        loginNombreChecker.rol = newUser.rol;
        await loginNombreChecker.save({transaction: t});
        await loginNombreChecker.restore({transaction: t});
        await t.commit();
        console.log('Usuario restaurado exitosamente');
        return res.status(200).json(Response.success(200, 'Usuario restaurado exitosamente', loginNombreChecker));
      }

      //loginNombre no existe
      if (nombreChecker.length > 0) {
        //algun nombre existe
        const activeNombre = nombreChecker.find((user) => user.deletedAt == null);
        if (activeNombre) {
          //Algún nombre está activo - Rechazar
          console.log('El nombre de usuario ya existe.');
          return res.status(409).json(Response.error(409, 'El nombre de usuario ya existe.'));
        }
      }
      //loginNombre no existe, nombre no existe o esta inactivo - Crear nuevo
      const createdUser = await Usuario.create(newUser, {transaction: t});
      await t.commit();
      console.log('Usuario creado exitosamente');
      return res.status(201).json(Response.success(201, 'Usuario creado exitosamente', createdUser));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al crear el usuario:', err);
      return res.status(500).json(Response.error(500, `Error al crear el usuario: ${err.message}`, err));
    }
  },

  GetAllUsers: async (req, res) => {
    //Para obtener todos los usuarios
    try {
      const users = await Usuario.findAll({
        attributes: ['usuarioID', 'nombre', 'rol'],
        order: [['rol', 'ASC']],
      });
      console.log('Usuarios obtenidos exitosamente');
      return res.status(200).json(Response.success(200, 'Usuarios obtenidos exitosamente', users));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener los usuarios:', err);
      return res.status(500).json(Response.error(500, `Error al obtener los usuarios: ${err.message}`, err));
    }
  },

  GetUser: async (req, res) => {
    //Para obtener un usuario
    try {
      const user = await Usuario.findByPk(req.params.id, {
        attributes: ['usuarioID', 'nombre', 'rol'],
      });
      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(404).json(Response.error(404, 'Usuario no encontrado'));
      }
      console.log('Usuario obtenido exitosamente');
      return res.status(200).json(Response.success(200, 'Usuario obtenido exitosamente', user));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al obtener el usuario:', err);
      return res.status(500).json(Response.error(500, `Error al obtener el usuario: ${err.message}`, err));
    }
  },

  UpdateUser: async (req, res) => {
    //Para modificar un usuario
    const t = await sequelize.transaction();
    try {
      const user = await Usuario.findByPk(req.body.usuarioID);
      if (!user) {
        // Usuario no encontrado - Rechazar
        console.log('Usuario no encontrado');
        return res.status(404).json(Response.error(404, 'Usuario no encontrado'));
      }
      const nombreChecker = await Usuario.findAll({where: {nombre: req.body.nombre, usuarioID: {[Op.ne]: req.body.usuarioID}}});
      const loginNombreChecker = await Usuario.findOne({where: {loginNombre: req.body.loginNombre, usuarioID: {[Op.ne]: req.body.usuarioID}}});

      if (loginNombreChecker) {
        //loginNombre existe - Rechazar
        console.log('El nombre de login ya existe.');
        return res.status(409).json(Response.error(409, 'El nombre de login ya existe.'));
      }
      if (nombreChecker.length > 0) {
        //loginNombre no existe, algun nombre existe
        const activeNombre = nombreChecker.find((user) => user.deletedAt == null);
        if (activeNombre) {
          //algun nombre esta activo - Rechazar
          console.log('El nombre de usuario ya existe.');
          return res.status(409).json(Response.error(409, 'El nombre de usuario ya existe.'));
        }
      }
      //loginNombre no existe y ningun nombre existe o todos estan inactivos - Modificar
      user.loginNombre = req.body.loginNombre;
      const hashedClave = await bcrypt.hash(req.body.clave, saltRound);
      user.clave = hashedClave;

      await user.save({transaction: t});
      t.commit();
      res.status(200).json(Response.success(200, 'Usuario modificado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al modificar el usuario:', err);
      return res.status(500).json(Response.error(500, `Error al modificar el usuario: ${err.message}`, err));
    }
  },

  DeleteUser: async (req, res) => {
    //Para eliminar un usuario
    const t = await sequelize.transaction();
    try {
      const user = await Usuario.findByPk(req.params.id);
      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(404).json(Response.error(404, 'Usuario no encontrado'));
      }
      await user.destroy({transaction: t});
      await t.commit();
      console.log('Usuario eliminado exitosamente');
      return res.status(200).json(Response.success(200, 'Usuario eliminado exitosamente'));
    } catch (err) {
      await t.rollback();
      if (err.name === 'SequelizeUniqueConstraintError') {
        console.log('Conflicto de datos únicos:', err);
        return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
      } else if (err.name === 'SequelizeValidationError') {
        console.log('Error de validación:', err);
        return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
      }
      console.log('Error al eliminar el usuario:', err);
      return res.status(500).json(Response.error(500, `Error al eliminar el usuario: ${err.message}`, err));
    }
  },
};
