const User = require('../models/userModel.js');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');


const getUser = async (req, res) => {
  try {
    // req.user lo pone authenticateToken
    if (!req.user) {
      return res.status(401).json({
        code: -200,
        message: "Usuario no autenticado"
      });
    }
    const user_data = {
      "id_user": req.user.id_user,
      "nombre": req.user.nombre,
      "apellidos": req.user.apellidos,
      "email": req.user.email,
      "photo": req.user.photo,
      "roles": req.user.roles,
      "created_at": req.user.created_at,
      "updated_at": req.user.updated_at
    };

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'User Detail',
      data: user_data 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ocurrió un error al obtener el usuario',
      error: error.message
    });
  }
};

// Carpeta donde multer guarda las fotos (middlewares/upload.js)
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Borra una foto subida; basename evita salir de la carpeta de uploads
const borrarFoto = (photo) => {
  if (!photo) return;
  fs.unlink(path.join(uploadsDir, path.basename(photo)), (err) => {
    if (err && err.code !== 'ENOENT') console.error('Error al borrar la foto', photo, err.message);
  });
};

const uploadPhoto = async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        code: -101,
        message: 'Sube un archivo'
      });
    }

    // La foto anterior ya no se usa
    borrarFoto(req.user.photo);

    await User.update({ photo: req.file.filename }, { where: { id_user: req.user.id_user } });

    // El frontend guarda el nombre del archivo y construye la URL con su endpoint
    return res.status(200).json({
      code: 1,
      message: 'Foto actualizada',
      photo: req.file.filename
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: -100,
      message: 'No se ha podido guardar la foto'
    });
  }
};

// --- Administración de usuarios (solo admin) ---

const ATRIBUTOS_PUBLICOS = ['id_user', 'nombre', 'apellidos', 'email', 'roles', 'photo', 'created_at'];

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({ attributes: ATRIBUTOS_PUBLICOS, order: [['created_at', 'DESC']] });
    res.status(200).json({ code: 1, message: 'Usuarios', data: usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: -100, message: 'Ocurrió un error al obtener los usuarios' });
  }
};

const cambiarRol = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = Number(req.params.id);
    // Un admin no puede quitarse el rol a sí mismo: podría quedarse la web sin ningún admin
    if (id === req.user.id_user) {
      return res.status(400).json({ code: -2, message: 'No puedes cambiar tu propio rol' });
    }

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ code: -10, message: 'Usuario no encontrado' });
    }

    usuario.roles = req.body.roles;
    await usuario.save();
    res.status(200).json({ code: 1, message: 'Rol actualizado', data: { id_user: usuario.id_user, roles: usuario.roles } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: -100, message: 'Ocurrió un error al cambiar el rol' });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = Number(req.params.id);
    if (id === req.user.id_user) {
      return res.status(400).json({ code: -2, message: 'No puedes eliminar tu propia cuenta desde aquí' });
    }

    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ code: -10, message: 'Usuario no encontrado' });
    }

    // Los tokens de recuperación se borran en cascada (clave foránea)
    await usuario.destroy();
    borrarFoto(usuario.photo);
    res.status(200).json({ code: 1, message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: -100, message: 'Ocurrió un error al eliminar el usuario' });
  }
};

module.exports = {
  getUser,
  uploadPhoto,
  listarUsuarios,
  cambiarRol,
  eliminarUsuario
};
