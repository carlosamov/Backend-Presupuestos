import Joi from 'joi';
import Response from '../../utils/Response.js';
import Rol from '../../utils/Rol.js';

const usuarioSchema = Joi.object({
  nombre: Joi.string()
    .trim()
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/)
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser una cadena de texto',
      'string.empty': 'El nombre no puede estar vacío',
      'any.required': 'El nombre es obligatorio',
      'string.min': 'El nombre debe tener entre 3 y 100 caracteres',
      'string.max': 'El nombre debe tener entre 3 y 100 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras, espacios, apóstrofes y guiones',
    }),
  loginNombre: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(4)
    .max(50)
    .required()
    .messages({
      'string.base': 'El nombre de usuario debe ser una cadena de texto',
      'string.empty': 'El nombre de usuario no puede estar vacío',
      'any.required': 'El nombre de usuario es obligatorio',
      'string.min': 'El nombre de usuario debe tener entre 4 y 50 caracteres',
      'string.max': 'El nombre de usuario debe tener entre 4 y 50 caracteres',
      'string.pattern.base': 'El nombre de usuario solo puede contener letras, números, puntos, guiones bajos y guiones',
    }),
  clave: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:¡!¿?'"()&%\/\\@#$*+=|^~`-]+$/)
    .min(6)
    .required()
    .messages({
      'string.base': 'La clave debe ser una cadena de texto',
      'string.empty': 'La clave no puede estar vacía',
      'any.required': 'La clave es obligatoria',
      'string.min': 'La clave debe tener al menos 6 caracteres alfanuméricos',
      'string.pattern.base': 'La clave debe tener al menos 6 caracteres alfanuméricos',
    }),
  rol: Joi.string()
    .valid(...Rol.getAllRoles())
    .required()
    .empty('')
    .default(null)
    .messages({
      'any.only': 'Rol no permitido',
      'any.required': 'El rol es obligatorio',
    }),
});

const validateUsuario = (req, res, next) => {
  const {error, value} = usuarioSchema.validate(req.body, {
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

const middlewares = [validateUsuario];

export default middlewares;
