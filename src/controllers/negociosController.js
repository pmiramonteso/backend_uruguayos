const Negocios = require('../models/negociosModel');
const { validationResult } = require('express-validator');

const getNegocios = async (req, res) => {
  try {
    const negocios = await Negocios.findAll();

    if (!negocios.length) {
      return res.status(200).json({
        code: 0,
        message: 'No hay negocios disponibles.',
        data: [],
      });
    }
    res.status(200).json({
      code: 1,
      message: 'Negocios List',
      data: negocios
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener los negocios',
    });
  }
};

const getNegocioById = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Buscar un usuario por su ID en la base de datos
    const negocio = await Negocios.findByPk(id);
    if (!negocio) {
      return res.status(404).json({
        code: -6,
        message: 'Negocio no encontrado'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Negocio Detail',
      data: negocio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener el negocio'
    });
  }
};

const addNegocio = async (req, res) => {
  console.log(req.body);
  try {
    const errors = validationResult(req);
    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { nombre, descripcion, direccion, latitud, longitud, tipoRedSocial, urlRedSocial, categoria } = req.body;
    let newNegocio;
    try {
      newNegocio = await Negocios.create({  nombre, descripcion, direccion, latitud, longitud, tipoRedSocial, urlRedSocial, categoria });
      console.log("Negocio creado: ", newNegocio);
    } catch (error) {
      console.error('Error al guardar el negocio:', error);
      // Si hay un error de duplicación de clave única (por ejemplo, título duplicado)
      if (error.nombre === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
          code: -61,
          message: 'Duplicate Negocio Title'
        });
      } else {
        res.status(500).json({
          code: -100,
          message: 'Error creando el negocio',
          error: error.message
        });
      }
      return;
    }

    if (!newNegocio) {
      return res.status(404).json({
        code: -6,
        message: 'Ha ocurrido un error al agregar el negocio'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Negocio agregado exitosamente',
      data: newNegocio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al añadir el negocio'
    });
  }
};

const updateNegocio = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nombre, descripcion, direccion, latitud, longitud, tipoRedSocial, urlRedSocial, categoria } = req.body;

    // Buscar un usuario por su ID en la base de datos
    const negocio = await Negocios.findByPk(id);
    if (!negocio) {
      return res.status(404).json({
        code: -3,
        message: 'Negocio no encontrado'
      });
    }

    // Actualizar el correo electrónico y la contraseña del usuario
    negocio.nombre = nombre;
    negocio.descripcion = descripcion;
    negocio.direccion = direccion;
    negocio.latitud = latitud;
    negocio.longitud = longitud;
    negocio.tipoRedSocial = tipoRedSocial;
    negocio.urlRedSocial = urlRedSocial;
    negocio.categoria = categoria;
    await negocio.save();

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Negocio Updated Successfully',
      data: negocio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el negocio'
    });
  }
};

const deleteNegocio = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Buscar un libro por su ID en la base de datos y eliminarlo
    const deletedNegocio = await Negocios.destroy({ where: { id_negocio: id } });

    // Verificar si el libro fue encontrado y eliminado
    if (!deletedNegocio) {
      return res.status(404).json({
        code: -100,
        message: 'Negocio Not Found'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Negocio Deleted Successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al eliminar el negocio'
    });
  }
};

module.exports = {
    getNegocios,
    getNegocioById,
    addNegocio,
    updateNegocio,
    deleteNegocio
};
