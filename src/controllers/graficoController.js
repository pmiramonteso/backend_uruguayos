const Emigrantes = require('../models/graficoModel');
const { validationResult } = require('express-validator');
const Sequelize = require('sequelize');


const getDatos = async (req, res) => {
  try {
    const datos = await Emigrantes.findAll();

    if (!datos.length) {
      return res.status(200).json({
        code: 0,
        message: 'No hay datos disponibles.',
        data: [],
      });
    }
    res.status(200).json({
      code: 1,
      message: 'Datos List',
      data: datos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener los negocios',
    });
  }
};

const getDatoById = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Buscar un usuario por su ID en la base de datos
    const dato = await Emigrantes.findByPk(id);
    if (!dato) {
      return res.status(404).json({
        code: -6,
        message: 'Dato no encontrado'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Dato Detail',
      data: dato
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener el negocio'
    });
  }
};

const addDato = async (req, res) => {
  console.log(req.body);
  try {
    const errors = validationResult(req);
    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } 
    const { año, emigrantes_hombres, emigrantes_mujeres, total_emigrantes_mundo, total_emigrantes_pais, total_emigrantes_españa, nacionalidad_extranjera, nacionalidad_española, pais_destino, provincia_destino, total_emigrantes_provincia
    } = req.body;
    let newDato;
    try {
      newDato = await Emigrantes.create({ año, emigrantes_hombres, emigrantes_mujeres, total_emigrantes_mundo, total_emigrantes_pais, total_emigrantes_españa, nacionalidad_extranjera, nacionalidad_española, pais_destino, provincia_destino, total_emigrantes_provincia
      });
      console.log("Dato creado: ", newDato);
    } catch (error) {
      console.error('Error al guardar el dato:', error);
      // Si hay un error de duplicación de clave única (por ejemplo, título duplicado)
      if (error.nombre === 'SequelizeUniqueConstraintError') {
        res.status(400).json({
          code: -61,
          message: 'Duplicate Dato Title'
        });
      } else {
        res.status(500).json({
          code: -100,
          message: 'Error creando el dato',
          error: error.message
        });
      }
      return;
    }

    if (!newDato) {
      return res.status(404).json({
        code: -6,
        message: 'Ha ocurrido un error al agregar el dato'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Dato agregado exitosamente',
      data: newDato
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al añadir el dato'
    });
  }
};

const updateDato = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { año, emigrantes_hombres, emigrantes_mujeres, total_emigrantes_mundo, total_emigrantes_pais, total_emigrantes_españa, nacionalidad_extranjera, nacionalidad_española, pais_destino, provincia_destino, total_emigrantes_provincia
    } = req.body;

    // Buscar un usuario por su ID en la base de datos
    const dato = await Emigrantes.findByPk(id);
    if (!dato) {
      return res.status(404).json({
        code: -3,
        message: 'Dato no encontrado'
      });
    }

    // Actualizar el correo electrónico y la contraseña del usuario
    dato.año = año;
    dato.emigrantes_hombres = emigrantes_hombres;
    dato.emigrantes_mujeres = emigrantes_mujeres;
    dato.total_emigrantes_mundo = total_emigrantes_mundo;
    dato.total_emigrantes_pais = total_emigrantes_pais;
    dato.total_emigrantes_españa = total_emigrantes_españa;
    dato.nacionalidad_extranjera = nacionalidad_extranjera;
    dato.nacionalidad_española = nacionalidad_española;
    dato.pais_destino = pais_destino;
    dato.provincia_destino = provincia_destino;
    dato.total_emigrantes_provincia = total_emigrantes_provincia;
    
    await dato.save();

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Dato Updated Successfully',
      data: dato
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el dato'
    });
  }
};

const deleteDato = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Buscar un libro por su ID en la base de datos y eliminarlo
    const deletedDato = await Emigrantes.destroy({ where: { id_datos: id } });

    // Verificar si el libro fue encontrado y eliminado
    if (!deletedDato) {
      return res.status(404).json({
        code: -100,
        message: 'Dato Not Found'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Dato Deleted Successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al eliminar el dato'
    });
  }
}

const getGrafico1 = async (req, res) => {
  try {
    const datos = await Emigrantes.findAll({
      attributes: [
        'año',
        [Sequelize.fn('SUM', Sequelize.col('total_emigrantes_españa')), 'total_emigrantes_españa'],
        [Sequelize.fn('SUM', Sequelize.col('nacionalidad_extranjera')), 'nacionalidad_extranjera'],
        [Sequelize.fn('SUM', Sequelize.col('nacionalidad_española')), 'nacionalidad_española'],
      ],
      where: Sequelize.literal(`
        (total_emigrantes_españa IS NOT NULL AND total_emigrantes_españa > 0)
        OR (nacionalidad_extranjera IS NOT NULL AND nacionalidad_extranjera > 0)
        OR (nacionalidad_española IS NOT NULL AND nacionalidad_española > 0)
      `),
      group: ['año'],
      order: [['año', 'ASC']],
      raw: true,
    });

    res.json({
      labels: datos.map(row => row.año),
      values: {
        total_emigrantes_españa: datos.map(row => row.total_emigrantes_españa),
        nacionalidad_extranjera: datos.map(row => row.nacionalidad_extranjera),
        nacionalidad_española: datos.map(row => row.nacionalidad_española),
      },
    });
  } catch (error) {
    res.status(500).send('Error al obtener datos para el gráfico 1');
  }
};

  const getGrafico3 = async (req, res) => {
    try {
      const datos = await Emigrantes.findAll({
        attributes: ['año', [Sequelize.fn('SUM', Sequelize.col('total_emigrantes_mundo')), 'total']],
        where: Sequelize.literal(`
        (total_emigrantes_mundo IS NOT NULL AND total_emigrantes_mundo > 0)`),
        group: ['año'],
        order: [['año', 'ASC']],
        raw: true,
      });
  
      res.json({
        labels: datos.map(row => row.año),
        values: datos.map(row => row.total),
      });
    } catch (error) {
      res.status(500).send('Error al obtener datos para el gráfico 3');
    }
  };

  const getGrafico4 = async (req, res) => {
    try {
      const datos = await Emigrantes.findAll({
        attributes: ['año', 'pais_destino', [Sequelize.fn('SUM', Sequelize.col('total_emigrantes_pais')), 'total']],
        where: {
          total_emigrantes_pais: { [Sequelize.Op.gt]: 0 },
          año: { [Sequelize.Op.in]: [1990, 2000, 2010, 2020] }
        },
        group: ['año', 'pais_destino'],
        order: [['año', 'ASC'], ['total', 'DESC']],
        raw: true,
      });
  
      const data = datos.reduce((result, row) => {
        if (!result[row.año]) {
          result[row.año] = { anio: row.año, labels: [], values: [] };
        }
        result[row.año].labels.push(row.pais_destino);
        result[row.año].values.push(row.total);
        return result;
      }, {});
  
      res.json(Object.values(data));
    } catch (error) {
      res.status(500).send('Error al obtener datos para el gráfico 4');
    }
  };
  

module.exports = {
    getDatos,
    getDatoById,
    addDato,
    updateDato,
    deleteDato,
    getGrafico1,
    getGrafico3,
    getGrafico4,
};
