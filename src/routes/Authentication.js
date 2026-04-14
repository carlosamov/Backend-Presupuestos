import express from 'express';
const router = express.Router();
import AuthController from '../controllers/public/Authentication.js'; //controlador
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máximo 20 intentos por IP
  message: {error: 'Demasiados intentos de login, intenta más tarde.'},
});

router.post('/auth/login', loginLimiter, AuthController.login);
router.post('/auth/authenticate', AuthController.certifyToken);
router.post('/auth/refresh', AuthController.updateToken);
router.post('/auth/logout', AuthController.logout);

export default router;
