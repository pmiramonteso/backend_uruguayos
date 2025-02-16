const moment = require('moment');
const Eventos = require('../models/eventoModel');
const { validationResult } = require('express-validator');

// Obtener todos los eventos
const getEventos = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Obtener todos los eventos de la base de datos
    const eventos = await Eventos.findAll();
    const eventosConFechasFormateadas = eventos.map(evento => ({
      ...evento.toJSON(),
      fecha: moment(evento.fecha).format('YYYY-MM-DD'),
      fecha_fin: evento.fecha_fin ? moment(evento.fecha_fin).format('YYYY-MM-DD') : null,
      hora_inicio: evento.hora_inicio ? moment(evento.hora_inicio, 'HH:mm:ss').format('HH:mm') : null,
      hora_fin: evento.hora_fin ? moment(evento.hora_fin, 'HH:mm:ss').format('HH:mm') : null
    }));
    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Eventos Listados',
      data: eventosConFechasFormateadas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener los eventos',
    });
  }
};

// Obtener un evento por ID
const getEventoById = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Buscar un evento por su ID en la base de datos
    const evento = await Eventos.findByPk(id);
    if (!evento) {
      return res.status(404).json({
        code: -6,
        message: 'Evento no encontrado'
      });
    }
    const eventosConFechasFormateadas = evento.map(evento => ({
      ...evento.toJSON(),
      fecha: moment(evento.fecha).format('YYYY-MM-DD'),
      fecha_fin: evento.fecha_fin ? moment(evento.fecha_fin).format('YYYY-MM-DD') : null,
      hora_inicio: evento.hora_inicio ? moment(evento.hora_inicio, 'HH:mm:ss').format('HH:mm') : null,
      hora_fin: evento.hora_fin ? moment(evento.hora_fin, 'HH:mm:ss').format('HH:mm') : null
    }));
    
    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Detalle del Evento',
      data: eventosConFechasFormateadas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener el evento'
    });
  }
};

// Agregar un evento
const addEvento = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, descripcion, fecha, fecha_fin, hora_inicio, hora_fin, color, entrada, precio, ubicacion } = req.body;
    let photo = req.file ? req.file.filename : null;

    // Validación adicional para precio si la entrada es 'Pago'
    if (entrada === 'Pago' && (!precio || precio <= 0)) {
      return res.status(400).json({
        code: -62,
        message: 'Debe proporcionar un precio válido cuando el evento tiene un costo'
      });
    }

    const newEvento = new Eventos ({
        titulo,
        descripcion,
        fecha,
        fecha_fin,
        hora_inicio,
        hora_fin,
        color,
        entrada,
        precio: entrada === 'Pago' ? precio : null,
        ubicacion,
        photo
      });
      await newEvento.save();

      res.status(200).json({
      code: 1,
      message: 'Evento agregado con éxito',
      data: newEvento
    });
   
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al añadir el evento'
    });
  }
};

// Actualizar un evento
const updateEvento = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { titulo, descripcion, fecha, fecha_fin, hora_inicio, hora_fin, color, entrada, precio, ubicacion, photo } = req.body;

    // Validación adicional para precio si la entrada es 'Pago'
    if (entrada === 'Pago' && (!precio || precio <= 0)) {
      return res.status(400).json({
        code: -62,
        message: 'Debe proporcionar un precio válido cuando el evento tiene un costo'
      });
    }

    // Buscar un evento por su ID en la base de datos
    const evento = await Eventos.findByPk(id);
    if (!evento) {
      return res.status(404).json({
        code: -3,
        message: 'Evento no encontrado'
      });
    }

    // Actualizar el evento
    evento.titulo = titulo;
    evento.descripcion = descripcion;
    evento.fecha = fecha;
    evento.fecha_fin = fecha_fin;
    evento.hora_inicio = hora_inicio;
    evento.hora_fin = hora_fin;
    evento.color = color;
    evento.entrada = entrada;
    evento.precio = entrada === 'Pago' ? req.body.precio : null; // Solo asignamos precio si es "Pago"
    evento.ubicacion = ubicacion;
    evento.photo = photo;
    await evento.save();

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Evento actualizado con éxito',
      data: evento
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el evento'
    });
  }
};

// Eliminar un evento
const deleteEvento = async (req, res) => {
  try {
    const errors = validationResult(req);

    // Si hay errores de validación, responde con un estado 400 Bad Request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // Buscar un evento por su ID en la base de datos y eliminarlo
    const deletedEvento = await Eventos.destroy({ where: { id_evento: id } });

    // Verificar si el evento fue encontrado y eliminado
    if (!deletedEvento) {
      return res.status(404).json({
        code: -100,
        message: 'Evento no encontrado'
      });
    }

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'Evento eliminado con éxito'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al eliminar el evento'
    });
  }
};

module.exports = {
  getEventos,
  getEventoById,
  addEvento,
  updateEvento,
  deleteEvento
};
