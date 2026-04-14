import express from 'express';
const router = express.Router();
import reqID from '../middleware/verifyId.js';

//Middleware
import categoriasValidator from '../middleware/validators/CategoriasValidator.js';
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Controlador
import categoryController from '../controllers/private/Categorias.js';

// Ruta para categorias
router.post('/category', isUser, ...categoriasValidator, categoryController.AddCategory);
router.get('/category', isUser, categoryController.GetAllCategories);
router.get('/category/:id', isUser, reqID, categoryController.GetCategory);
router.put('/category/', isAdmin, ...categoriasValidator, categoryController.UpdateCategory);
router.delete('/category/:id', isAdmin, reqID, categoryController.DeleteCategory);

export default router;
