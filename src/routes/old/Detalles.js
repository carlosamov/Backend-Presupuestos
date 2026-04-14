const express = require('express');
const router = express.Router();
const reqID = require('../../middleware/verifyId');

//Middleware
const detallesValidator = require('../../middleware/validators/DetallesValidator');
const {isSuperAdmin, isAdmin, isUser} = require('../../middleware/verifyToken');

//Controlador
const detailController = require('../controllers/private/Detalles');

// Ruta para Detalles
router.post('/detail', isAdmin, ...detallesValidator, detailController.AddDetail);
router.get('/detail/:id', isUser, reqID, detailController.GetDetailsByBudgetID);
router.put('/detail', isAdmin, ...detallesValidator, detailController.UpdateDetail);
router.delete('/detail/:id', isAdmin, reqID, detailController.DeleteDetail);

module.exports = router;
