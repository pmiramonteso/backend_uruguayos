const { body } = require('express-validator');

const negocioValidator = [
    body("nombre")
        .exists()
        .withMessage("El nombre es obligatorio")
        .isString()
        .withMessage("El nombre debe ser una cadena de texto")
        .isLength({ min: 3, max: 50 })
        .withMessage("El nombre debe tener entre 3 y 100 caracteres"),
    body("descripcion")
        .exists()
        .withMessage("La descripción es obligatoria")
        .isString()
        .withMessage("La descripción debe ser una cadena de texto")
        .isLength({ min: 10, max: 255 })
        .withMessage("La descripción debe tener entre 10 y 255 caracteres"),
    body("direccion")
        .optional()
        .isString()
        .withMessage("La dirección debe ser una cadena de texto")
        .isLength({ max: 200 })
        .withMessage("La dirección no puede superar los 200 caracteres"),
    body("latitud")
        .optional({ checkFalsy: true })
        .isDecimal()
        .withMessage("La latitud debe ser un número decimal válido"),
    body("longitud")
        .optional({ checkFalsy: true })
        .isDecimal()
        .withMessage("La longitud debe ser un número decimal válido"),
    body("tipoRedSocial")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("El tipo de red social debe ser una cadena de texto")
        .isIn(["instagram", "pagina_web", "twitter", "facebook", "youtube"])
        .withMessage("El tipo de red social debe ser una de las siguientes: instagram, pagina_web, twitter, facebook, youtube"),
    body("urlRedSocial")
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage("La URL de la red social debe ser válida"),
    body("categoria")
        .exists()
        .withMessage("La categoría es obligatoria")
        .isString()
        .withMessage("La categoría debe ser una cadena de texto")
        .isIn(["restaurante", "panaderia", "centro social", "otros"])
        .withMessage("La categoría debe ser una de las siguientes: restaurante, panaderia, centro social, otros")
];

module.exports = {
    negocioValidator
};
