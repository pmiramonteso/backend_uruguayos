const { Router } = require('express');
const { body } = require('express-validator');
const { getUser, uploadPhoto, listarUsuarios, cambiarRol, eliminarUsuario } = require('../controllers/userController.js');
const { authenticateToken } = require('../middlewares/authenticateToken.js');
const { uploadFileMiddleware } = require('../middlewares/upload.js');
const { idValidator } = require('../validations/generic.Validation.js');

const router = Router();

// El usuario con sesión: sus datos y su foto
router.get('/', authenticateToken(['admin', 'user']), getUser);
router.post("/upload-photo", authenticateToken(['admin', 'user']), uploadFileMiddleware, uploadPhoto);

// Administración de usuarios
router.get('/todos', authenticateToken(['admin']), listarUsuarios);
router.patch('/:id/rol', authenticateToken(['admin']), idValidator,
  body('roles').isIn(['user', 'admin']).withMessage('El rol debe ser user o admin'), cambiarRol);
router.delete('/:id', authenticateToken(['admin']), idValidator, eliminarUsuario);

module.exports = router;
