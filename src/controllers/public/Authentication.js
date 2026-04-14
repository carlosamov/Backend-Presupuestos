import {checkToken, generateToken} from '../../utils/JWT.js'; // Para generar tokens
import Response from '../../utils/Response.js'; // Para manejar respuestas
import bcrypt from 'bcrypt';
import UserModel from '../../models/Usuario.js'; // Modelo de usuario

export default {
  login: async (req, res) => {
    const {loginNombre, clave} = req.body;
    if (!loginNombre || !clave) {
      console.log('Faltan datos de inicio de sesión');
      return res.status(400).json(Response.error(400, 'Faltan datos de inicio de sesión'));
    }

    try {
      //Encontrar el usuario en la base de datos
      const user = await UserModel.findOne({
        where: {
          loginNombre: loginNombre,
        },
        attributes: ['usuarioID', 'nombre', 'loginNombre', 'rol', 'clave'],
      });

      //Si no existe el usuario, retornar error
      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(404).json(Response.error(404, 'Credenciales incorrectas'));
      }

      //Validar el usuario
      const isMatch = await bcrypt.compare(clave, user.clave);
      if (!isMatch) {
        console.log('Credenciales incorrectas');
        return res.status(404).json(Response.error(404, 'Credenciales incorrectas'));
      }

      const token = generateToken({
        usuarioID: user.usuarioID,
        nombre: user.nombre,
        loginNombre: user.loginNombre,
        rol: user.rol,
      });
      const safeUser = user.get({plain: true});
      delete safeUser.clave;

      res.cookie('token', token, {
        httpOnly: true,
        secure: false, //Cambiar a true si es https, por ahora, estamos en http
        sameSite: 'lax', //Evita que otros servers envien peticiones (strict | none)
      });
      console.log('Usuario autenticado exitosamente');
      return res.status(200).json(Response.success(200, 'Usuario encontrado', {user: safeUser}));
    } catch (err) {
      console.log('Error al validar el usuario:', err);
      return res.status(500).json(Response.error(500, 'Error al validar el usuario', err));
    }
  },

  logout: async (req, res) => {
    try {
      //Eliminar la cookie del token
      res.clearCookie('token', {
        httpOnly: true,
        secure: false, // Cambiar a true si es https, por ahora estamos en http
        sameSite: 'strict', // Evita que otros servers envien peticiones
      });
      console.log('Sesión cerrada correctamente');
      return res.status(200).json(Response.success(200, 'Sesión cerrada correctamente'));
    } catch (err) {
      console.log('Error al cerrar sesión:', err);
      return res.status(500).json(Response.error(500, 'Error al cerrar sesión', err));
    }
  },

  certifyToken: async (req, res) => {
    try {
      //Se obtiene el token mediante cookies o body
      const token = req.cookies?.token || null;
      if (!token) {
        console.log('Token no proporcionado');
        return res.status(401).json(Response.error(401, 'Token no proporcionado'));
      }

      const data = checkToken(token);
      if (!data) {
        console.log('Token invalido o expirado');
        return res.status(401).json(Response.error(401, 'Token invalido o expirado'));
      } else {
        console.log('Token valido');
        return res.status(200).json(Response.success(200, 'Token valido', data));
      }
    } catch (err) {
      console.log('Error al validar jwt:', err);
      return res.status(500).json(Response.error(500, 'Error al validar jwt', err));
    }
  },

  updateToken: async (req, res) => {
    try {
      //Se obtiene el token mediante cookies o body
      const token = req.cookies?.token || null;
      const data = checkToken(token);
      if (!data) {
        console.log('Token invalido o expirado');
        return res.status(401).json(Response.error(401, 'Token invalido o expirado'));
      }
      const newToken = generateToken(data);

      res.cookie('token', newToken, {
        httpOnly: true,
        secure: false, // Cambiar a true si es https, por ahora estamos en http
        sameSite: 'strict', //Evita que otros servers envien peticiones
      });
      console.log('Token renovado exitosamente');
      return res.status(200).json(Response.success(200, 'Token valido', newToken));
    } catch (err) {
      console.log('Error al validar jwt:', err);
      return res.status(500).json(Response.error(500, 'Error al validar jwt', err));
    }
  },
};
