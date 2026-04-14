import Joi from 'joi';
import Response from '../../utils/Response.js';

const categoriaSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre de la categoria debe ser una cadena de texto',
      'string.empty': 'El nombre de la categoria no puede estar vacío',
      'any.required': 'El nombre de la categoria es obligatorio',
      'string.min': 'El nombre de la categoria debe tener entre 1 y 100 caracteres',
      'string.max': 'El nombre de la categoria debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El nombre de la categoria solo puede contener letras, espacios y signos de puntuación',
    }),
  categoriaID: Joi.number().integer().positive().optional().default(null).messages({
    'number.base': 'El ID de la categoria debe ser un número',
    'number.integer': 'El ID de la categoria debe ser un número entero',
    'number.positive': 'El ID de la categoria debe ser un número positivo',
  }),
});

const validateCategoria = (req, res, next) => {
  const {error, value} = categoriaSchema.validate(req.body, {
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

const middlewares = [validateCategoria];

export default middlewares;
