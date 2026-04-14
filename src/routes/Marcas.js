import express from 'express';
const router = express.Router();
import reqID from '../middleware/verifyId.js';

//Middleware
import marcasValidator from '../middleware/validators/MarcasValidator.js';
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Controlador
import brandController from '../controllers/private/Marcas.js';

// Ruta para marcas
router.post('/brand', isUser, ...marcasValidator, brandController.AddBrand);
router.get('/brand', isUser, brandController.GetAllBrands);
router.get('/brand/:id', isUser, reqID, brandController.GetBrand);
router.put('/brand/', isAdmin, ...marcasValidator, brandController.UpdateBrand);
router.delete('/brand/:id', isAdmin, reqID, brandController.DeleteBrand);

export default router;
