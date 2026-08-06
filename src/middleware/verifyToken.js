import {checkToken} from '../utils/JWT.js';
import Response from '../utils/Response.js'; // Para manejar respuestas
import Rol from '../utils/Rol.js';

const getToken = (req) => {
  const cookieToken = req.cookies?.token;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};

export const isSuperAdmin = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    console.log(`[auth] isSuperAdmin denegado para ${req.originalUrl}: token ausente`);
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }

  const user = checkToken(token);
  if (user?.rol === Rol.SUPERADMIN) {
    req.user = user;
    console.log(`[auth] isSuperAdmin permitido para ${req.originalUrl}`);
    next();
  } else {
    console.log(`[auth] isSuperAdmin denegado para ${req.originalUrl}: rol inválido`);
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }
};

export const isAdmin = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    console.log(`[auth] isAdmin denegado para ${req.originalUrl}: token ausente`);
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }

  const user = checkToken(token);
  if (user?.rol === Rol.ADMIN || user?.rol === Rol.SUPERADMIN) {
    req.user = user;
    console.log(`[auth] isAdmin permitido para ${req.originalUrl}`);
    next();
  } else {
    console.log(`[auth] isAdmin denegado para ${req.originalUrl}: rol inválido`);
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }
};

export const isUser = (req, res, next) => {
  const token = getToken(req);
  const user = checkToken(token);

  if (!user) {
    console.log(`[auth] isUser denegado para ${req.originalUrl}: token ausente o inválido`);
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }

  if (user.rol === Rol.USER || user.rol === Rol.ADMIN || user.rol === Rol.SUPERADMIN) {
    req.user = user;
    console.log(`[auth] isUser permitido para ${req.originalUrl}`);
    next();
  } else {
    console.log(`[auth] isUser denegado para ${req.originalUrl}: rol inválido`);
    return res.status(403).json(Response.error(403, 'Acceso denegado'));
  }
};
