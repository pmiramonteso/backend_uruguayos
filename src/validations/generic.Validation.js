const { check, body } = require('express-validator');

const idValidator = [
    check('id').isInt().withMessage('Invalid ID')
];

const nameValidator = [
    body('nombre').isString().withMessage('Invalid Name file')
];

module.exports = {
    idValidator,
    nameValidator
};
