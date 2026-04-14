import express from 'express';
const router = express.Router();
import reqID from '../middleware/verifyId.js';

//Middleware
import productosValidator from '../middleware/validators/ProductosValidator.js';
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Controlador
import productController from '../controllers/private/Productos.js';

// Ruta para productos
router.post('/products', isUser, ...productosValidator, productController.AddProduct);
router.get('/products', isUser, productController.GetAllProducts);
router.get('/products/:id', isUser, reqID, productController.GetProduct);
router.put('/products', isAdmin, ...productosValidator, productController.UpdateProduct);
router.delete('/products/:id', isAdmin, reqID, productController.DeleteProduct);

export default router;
