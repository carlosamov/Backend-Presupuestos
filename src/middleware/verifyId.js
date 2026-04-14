import Response from '../utils/Response.js';

export default (req, res, next) => {
  if (!req.params.id) return res.status(400).json(Response.error(400, 'ID no proporcionado'));
  try {
    req.params.id = parseInt(req.params.id);
  } catch (error) {
    return res.status(400).json(Response.error(400, 'ID no válido'));
  }
  if (req.params.id <= 0) return res.status(400).json(Response.error(400, 'ID debe ser mayor a 0'));
  next();
};
