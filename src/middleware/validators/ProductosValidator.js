import Joi from 'joi';
import Response from '../../utils/Response.js';

const productoSchema = Joi.object({
  productoID: Joi.number().integer().min(1).optional().messages({
    'number.base': 'El ID del producto debe ser un número entero',
    'number.min': 'El ID del producto debe ser un número entero positivo',
  }),
  nombre: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser una cadena de texto',
      'string.empty': 'El nombre no puede estar vacío',
      'any.required': 'El nombre es obligatorio',
      'string.min': 'El nombre debe tener entre 1 y 100 caracteres',
      'string.max': 'El nombre debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras, números, espacios y signos de puntuación',
    }),
  modelo: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .required()
    .messages({
      'string.base': 'El modelo debe ser una cadena de texto',
      'string.empty': 'El modelo no puede estar vacío',
      'any.required': 'El modelo es obligatorio',
      'string.min': 'El modelo debe tener al menos 1 carácter',
      'string.pattern.base': 'El modelo solo puede contener letras, números, espacios y signos de puntuación',
    }),
  descripcion: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.base': 'La descripción debe ser una cadena de texto',
      'string.empty': 'La descripción no puede estar vacía',
      'any.required': 'La descripción es obligatoria',
      'string.min': 'La descripción debe tener entre 1 y 500 caracteres',
      'string.max': 'La descripción debe tener entre 1 y 500 caracteres',
      'string.pattern.base': 'La descripción solo puede contener letras, números, espacios y signos de puntuación',
    }),
  enlace: Joi.string().trim().uri().allow(null, '').optional().empty('').default(null).messages({
    'string.uri': 'El enlace debe ser una URL válida',
  }),
  marcaID: Joi.number().integer().min(1).allow(null, '').optional().messages({
    'number.base': 'El ID de la marca debe ser un número entero',
    'number.min': 'El ID de la marca debe ser un número entero positivo',
  }),
  categoriaID: Joi.number().integer().min(1).allow(null, '').optional().messages({
    'number.base': 'El ID de la categoría debe ser un número entero',
    'number.min': 'El ID de la categoría debe ser un número entero positivo',
  }),
  numeroParte: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .allow(null, '')
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El numero de parte debe ser una cadena de texto',
      'string.empty': 'El numero de parte no puede estar vacío',
      'any.required': 'El numero de parte es obligatorio',
      'string.min': 'El numero de parte debe tener entre 1 y 100 caracteres',
      'string.max': 'El numero de parte debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El numero de parte solo puede contener letras, números, espacios y signos de puntuación',
    }),
  precio: Joi.number().positive().precision(2).allow(null, '').optional().messages({
    'number.base': 'El precio debe ser un número',
    'number.positive': 'El precio debe ser un número positivo',
    'number.precision': 'El precio debe tener como máximo dos decimales',
    'any.required': 'El precio es obligatorio',
  }),
});

const validateProducto = (req, res, next) => {
  const {error, value} = productoSchema.validate(req.body, {
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

const middlewares = [validateProducto];

export default middlewares;
