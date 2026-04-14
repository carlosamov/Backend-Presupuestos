import Joi from 'joi';
import Response from '../../utils/Response.js';

const marcaSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre de la marca debe ser una cadena de texto',
      'string.empty': 'El nombre de la marca no puede estar vacío',
      'any.required': 'El nombre de la marca es obligatorio',
      'string.min': 'El nombre de la marca debe tener entre 1 y 100 caracteres',
      'string.max': 'El nombre de la marca debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El nombre de la marca solo puede contener letras, espacios y signos de puntuación',
    }),
  marcaID: Joi.number().integer().positive().optional().default(null).messages({
    'number.base': 'El ID de la marca debe ser un número',
    'number.integer': 'El ID de la marca debe ser un número entero',
    'number.positive': 'El ID de la marca debe ser un número positivo',
  }),
});

const validateMarca = (req, res, next) => {
  const {error, value} = marcaSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errores = error.details.map((d) => ({message: d.message, path: d.path}));
    return res.status(400).json(Response.error(400, 'Errores de validación', errores));
  }

  req.body = value;
  next();
};

const middlewares = [validateMarca];

export default middlewares;
