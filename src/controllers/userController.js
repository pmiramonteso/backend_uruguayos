const User = require('../models/userModel.js');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
//https://www.bezkoder.com/node-js-express-file-upload/

const getUser = async (req, res) => {
  try {
    console.log("Usuario autenticado en la petición:", req.usuario);
    if (!req.usuario) {
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

const uploadPhoto = async (req, res) => {
  try {
    const rutaArchivo = "./uploads/"; // Ruta completa al archivo que deseas eliminar

    if (req.file == undefined) {
      return res.status(400).json({
        code: -101,
        message: 'Sube un archivo'
      });
    }

    // Si el usuario tiene foto, se la eliminamos
    if (req.user.photo != null) {
      console.log("Ruta:" + rutaArchivo + req.user.photo);
      fs.access(rutaArchivo + req.user.photo, fs.constants.F_OK, (err) => {
        if (err) {
          console.log('El archivo no existe o no tienes acceso');
        } else {
          // Eliminar el archivo
          fs.unlink(rutaArchivo + req.user.photo, (err) => {
            if (err) {
              console.error('Error al eliminar el archivo', err);
              return res.status(500).json({
                code: -103,
                message: 'Error al eliminar el archivo',
                error: err
              });
            }
            console.log('El archivo ha sido eliminado correctamente.');
          });
        }
      });
    } else {
      console.log("El usuario no tiene foto, la seteo en la DB");
    }

    // Actualizo la imagen del usuario
    console.log("Guardo la imagen: " + req.file.filename + " en el id de usuario: " + req.user.id_user);
    await User.update({ photo: req.file.filename }, { where: { id_user: req.user.id_user } });
    
    const photoUrl = `http://localhost:3000/assets/img/${req.file.filename}`;
    return res.status(200).json({
      code: 1,
      message: "Uploaded the file successfully: " + req.file.originalname,
      photoUrl
    });

  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      error: `${err}`
    });
  }
};

module.exports = {
  getUser,
  uploadPhoto
};
