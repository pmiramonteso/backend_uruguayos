const { Router } = require('express');
const { getUser, uploadPhoto } = require('../controllers/userController.js');
const { authenticateToken } = require('../middlewares/authenticateToken.js');
const { uploadFileMiddleware } = require('../middlewares/upload.js');

const router = Router();

// Rutas para obtener y modificar los datos de los usuarios
router.get('/', getUser);
router.post("/upload-photo", authenticateToken(['admin', 'user']), uploadFileMiddleware, uploadPhoto);

module.exports = router;
