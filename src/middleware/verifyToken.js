import {checkToken} from '../utils/JWT.js';
import Response from '../utils/Response.js'; // Para manejar respuestas
import Rol from '../utils/Rol.js';

export const isSuperAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json(Response.error(403, 'Acceso denegado'));

  const user = checkToken(token);
  if (user.rol === Rol.SUPERADMIN) {
    req.user = user;
    next();
  } else {
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }
};

export const isAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json(Response.error(403, 'Acceso denegado'));

  const user = checkToken(token);
  if (user.rol === Rol.ADMIN || user.rol === Rol.SUPERADMIN) {
    req.user = user;
    next();
  } else {
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }
};

export const isUser = (req, res, next) => {
  const token = req.cookies.token;
  const user = checkToken(token);

  if (!user) return res.status(403).json(Response.error(403, 'Acceso denegado'));

  if (user.rol === Rol.USER || user.rol === Rol.ADMIN || user.rol === Rol.SUPERADMIN) {
    req.user = user;
    next();
  } else {
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }
};
