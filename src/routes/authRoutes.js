const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const { registro, login, logout, forgotPassword, changePassword } = require('../controllers/authController.js');
const { registroValidator, loginValidator, forgotPasswordValidator, changePasswordValidator } = require('../validations/auth.Validation.js');
const { uploadFileMiddleware } = require("../middlewares/upload");
const router = Router();

// Límite de intentos por IP contra ataques de fuerza bruta
const limitar = (max, minutos) => rateLimit({
  windowMs: minutos * 60 * 1000,
  limit: max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { code: -429, message: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' }
});

// Rutas para registrarse e iniciar sesión
router.post('/registro', limitar(5, 60), uploadFileMiddleware, registroValidator, registro);
router.post('/login', limitar(10, 15), loginValidator, login);
router.post('/forgot-password', limitar(5, 60), forgotPasswordValidator, forgotPassword);
router.post('/change-password', limitar(10, 60), changePasswordValidator, changePassword);
router.post('/logout', logout);

module.exports = router;
