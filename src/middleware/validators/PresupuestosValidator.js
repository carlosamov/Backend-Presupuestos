import Joi from 'joi';
import Response from '../../utils/Response.js';

const presupuestoSchema = Joi.object({
  /*Cabecera*/
  /*Datos del Cliente*/
  nombrePresupuesto: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre del presupuesto debe ser una cadena de texto',
      'string.empty': 'El nombre del presupuesto no puede estar vacío',
      'any.required': 'El nombre del presupuesto es obligatorio',
      'string.min': 'El nombre del presupuesto debe tener entre 1 y 100 caracteres',
      'string.max': 'El nombre del presupuesto debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El nombre del presupuesto solo puede contener letras, números y signos de puntuación',
    }),
  nombreEmpresa: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El nombre de la empresa debe ser una cadena de texto',
      'string.max': 'El nombre de la empresa debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El nombre de la empresa solo puede contener letras, números y signos de puntuación',
    }),
  direccionEmpresa: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'La dirección debe ser una cadena de texto',
      'string.max': 'La dirección debe tener como máximo 100 caracteres',
      'string.pattern.base': 'La dirección solo puede contener letras, números y signos de puntuación',
    }),
  ciudadEmpresa: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'La ciudad debe ser una cadena de texto',
      'string.max': 'La ciudad debe tener como máximo 100 caracteres',
      'string.pattern.base': 'La ciudad solo puede contener letras, números y signos de puntuación',
    }),
  representanteEmpresa: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El representante debe ser una cadena de texto',
      'string.max': 'El representante debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El representante solo puede contener letras, números y signos de puntuación',
    }),
  /*Datos del Presupuesto*/
  fecha: Joi.date().required().messages({
    'date.base': 'La fecha debe ser una fecha válida',
    'any.required': 'La fecha es obligatoria',
  }),
  asunto: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El asunto debe ser una cadena de texto',
      'string.empty': 'El asunto no puede estar vacío',
      'any.required': 'El asunto es obligatorio',
      'string.min': 'El asunto debe tener entre 1 y 100 caracteres',
      'string.max': 'El asunto debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El asunto solo puede contener letras, números y signos de puntuación',
    }),
  solucion: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.base': 'La solución debe ser una cadena de texto',
      'string.empty': 'La solución no puede estar vacía',
      'any.required': 'La solución es obligatoria',
      'string.min': 'La solución debe tener entre 1 y 500 caracteres',
      'string.max': 'La solución debe tener entre 1 y 500 caracteres',
      'string.pattern.base': 'La solución solo puede contener letras, números y signos de puntuación',
    }),
  version: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'La versión debe ser una cadena de texto',
      'string.empty': 'La versión no puede estar vacía',
      'any.required': 'La versión es obligatoria',
      'string.min': 'La versión debe tener entre 1 y 100 caracteres',
      'string.max': 'La versión debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'La versión solo puede contener letras, números y signos de puntuación',
    }),
  presupuesto: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El presupuesto debe ser una cadena de texto',
      'string.empty': 'El presupuesto no puede estar vacío',
      'any.required': 'El presupuesto es obligatorio',
      'string.min': 'El presupuesto debe tener entre 1 y 100 caracteres',
      'string.max': 'El presupuesto debe tener entre 1 y 100 caracteres',
      'string.pattern.base': 'El presupuesto solo puede contener letras, números y signos de puntuación',
    }),

  /*Pie de Presupuesto*/
  notasTiempoEntrega: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(500)
    .optional()
    .messages({
      'string.base': 'Los tiempos de entrega deben ser una cadena de texto',
      'string.max': 'Los tiempos de entrega deben tener como máximo 500 caracteres',
      'string.pattern.base': 'Los tiempos de entrega solo pueden contener letras, números y signos de puntuación',
    }),
  notasGarantias: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(500)
    .optional()
    .messages({
      'string.base': 'Las notas de garantía deben ser una cadena de texto',
      'string.max': 'Las notas de garantía deben tener como máximo 500 caracteres',
      'string.pattern.base': 'Las notas de garantía solo pueden contener letras, números y signos de puntuación',
    }),
  notas: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(500)
    .optional()
    .messages({
      'string.base': 'Las notas deben ser una cadena de texto',
      'string.max': 'Las notas deben tener como máximo 500 caracteres',
      'string.pattern.base': 'Las notas solo pueden contener letras, números y signos de puntuación',
    }),
  incoterm: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El incoterm debe ser una cadena de texto',
      'string.max': 'El incoterm debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El incoterm solo puede contener letras, números y signos de puntuación',
    }),
  formaPago: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'La forma de pago debe ser una cadena de texto',
      'string.max': 'La forma de pago debe tener como máximo 100 caracteres',
      'string.pattern.base': 'La forma de pago solo puede contener letras, números y signos de puntuación',
    }),
  anticipo: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El anticipo debe ser una cadena de texto',
      'string.max': 'El anticipo debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El anticipo solo puede contener letras, números y signos de puntuación',
    }),
  tiempoInstalacion: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El tiempo de instalación debe ser una cadena de texto',
      'string.max': 'El tiempo de instalación debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El tiempo de instalación solo puede contener letras, números y signos de puntuación',
    }),
  tiempoEntrega: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El tiempo de entrega debe ser una cadena de texto',
      'string.max': 'El tiempo de entrega debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El tiempo de entrega solo puede contener letras, números y signos de puntuación',
    }),
  lugarEntrega: Joi.string()
    .trim()
    .empty('')
    .default(null)
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El lugar de entrega debe ser una cadena de texto',
      'string.max': 'El lugar de entrega debe tener como máximo 100 caracteres',
      'string.pattern.base': 'El lugar de entrega solo puede contener letras, números y signos de puntuación',
    }),
});

const validatePresupuesto = (req, res, next) => {
  const {error, value} = presupuestoSchema.validate(req.body, {
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

const middlewares = [validatePresupuesto];

export default middlewares;
