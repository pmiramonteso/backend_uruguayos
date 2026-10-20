const { Router } = require('express');
const { getBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController.js');
const { authenticateToken } = require('../middlewares/authenticateToken.js');
const { bookValidator } = require('../validations/book.Validation.js');
const { idValidator } = require('../validations/generic.Validation.js');

const router = Router();

// Rutas para obtener y modificar los datos de los usuarios
router.get('/', authenticateToken(['user']), getBooks);
router.get('/:id', authenticateToken(['user','mod','admin']), idValidator, getBookById);
router.post('/', authenticateToken(['user','mod','admin']), bookValidator, addBook);
router.patch('/:id', authenticateToken(['user','mod','admin']), idValidator, bookValidator, updateBook);
router.delete('/:id', authenticateToken(['user','mod','admin']), idValidator, deleteBook);
router.get('/top-ventas', getBooks);

module.exports = router;
