const {body, validationResult} = require('express-validator');

//Estos middleware se basan en la validacion del modelo del mismo.
const middlewares = [
  //Informacion del cliente
  //prettier-ignore
  body('cantidad')
  .exists({values: "null"}).withMessage('La cantidad es obligatoria')
  .isInt({min: 1}).withMessage('La cantidad debe ser un número entero positivo'),

  //prettier-ignore
  body('precioUnitario')
  .exists({values: "null"}).withMessage('El precio unitario es obligatorio')
  .isFloat({min: 0}).withMessage('El precio unitario debe ser un número decimal positivo'),

  //prettier-ignore
  body('traida')
  .exists({values: "null"}).withMessage('La traída es obligatoria')
  .isFloat({min: 0}).withMessage('La traída debe ser un número decimal positivo'),

  //prettier-ignore
  body('ganancia')
  .exists({values: "null"}).withMessage('La ganancia es obligatoria')
  .isFloat({min: 0}).withMessage('La ganancia debe ser un número decimal positivo'),

  //prettier-ignore
  body('productoID')
  .exists({values: "null"}).withMessage('El ID del producto es obligatorio')
  .isInt({min: 1}).withMessage('El ID del producto debe ser un número entero positivo'),

  //prettier-ignore
  body('presupuestoID')
  .exists({values: "null"}).withMessage('El ID del presupuesto es obligatorio')
  .isInt({min: 1}).withMessage('El ID del presupuesto debe ser un número entero positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(Response.error(400, 'Errores de validación', errors.array()));
    }
    next();
  },
];

module.exports = middlewares;
