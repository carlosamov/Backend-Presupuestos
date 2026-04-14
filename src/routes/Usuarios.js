import express from 'express';
const router = express.Router();
import reqID from '../middleware/verifyId.js';

//Middleware
import userDataValidator from '../middleware/validators/UsuariosValidator.js';
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Controlador
import userController from '../controllers/private/Usuarios.js';

// Ruta para usuarios
router.post('/user', isSuperAdmin, ...userDataValidator, userController.CreateUser);
router.get('/user', isSuperAdmin, userController.GetAllUsers);
router.get('/user/:id', isUser, reqID, userController.GetUser);
router.put('/user', isSuperAdmin, ...userDataValidator, userController.UpdateUser);
router.delete('/user/:id', isSuperAdmin, reqID, userController.DeleteUser);

export default router;
