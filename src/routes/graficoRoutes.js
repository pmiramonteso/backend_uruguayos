const { Router } = require('express');
const { getDatos, getDatoById, addDato, updateDato, deleteDato, getGrafico1, getGrafico3, getGrafico4 } = require('../controllers/graficoController');
const { authenticateToken } = require('../middlewares/authenticateToken.js');
const { emigrantesValidator } = require('../validations/graficoValidation.js');
const { idValidator } = require('../validations/generic.Validation');

const router = Router();

router.get('/', getDatos);
router.get('/grafico1', getGrafico1);
router.get('/grafico3', getGrafico3);
router.get('/grafico4', getGrafico4);

router.get('/:id', idValidator, getDatoById);
router.post('/', authenticateToken(['admin']), emigrantesValidator, addDato);
router.patch('/:id', authenticateToken(['admin']), idValidator, emigrantesValidator, updateDato);
router.delete('/:id', authenticateToken(['admin']), idValidator, deleteDato);

module.exports = router;