import Response from '../utils/Response.js';

export default (req, res, next) => {
  if (!req.params.id) {
    console.log(`[verifyId] ID no proporcionado para ${req.method} ${req.originalUrl}`);
    return res.status(400).json(Response.error(400, 'ID no proporcionado'));
  }
  const parsedId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(parsedId)) {
    console.log(`[verifyId] ID no valido para ${req.method} ${req.originalUrl}: ${req.params.id}`);
    return res.status(400).json(Response.error(400, 'ID no válido'));
  }
  req.params.id = parsedId;
  if (req.params.id <= 0) {
    console.log(`[verifyId] ID debe ser mayor a 0 para ${req.method} ${req.originalUrl}: ${req.params.id}`);
    return res.status(400).json(Response.error(400, 'ID debe ser mayor a 0'));
  }
  next();
};
