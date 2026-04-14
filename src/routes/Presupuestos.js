import express from 'express';
const router = express.Router();
import reqID from '../middleware/verifyId.js';

//Middleware
import presupuestosValidator from '../middleware/validators/PresupuestosValidator.js';
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Controlador
import budgetController from '../controllers/private/Presupuestos.js';

// Ruta para presupuestos
router.post('/budget', isUser, ...presupuestosValidator, budgetController.AddBudget);
router.post('/budget/:id', isUser, reqID, budgetController.CloneBudget);
router.get('/budget', isUser, budgetController.GetAllBudgets);
//router.get('/budget/:id', isUser, reqID, budgetController.GetBudget);
//router.put('/budget', isAdmin, ...presupuestosValidator, budgetController.UpdateBudget);
router.delete('/budget/:id', isUser, reqID, budgetController.DeleteBudget);

export default router;
