const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RecoveryToken = require('../models/recoveryTokenModel');
const sendEmail = require("../utils/email/sendEmail");
const { validationResult } = require('express-validator');
const { serialize } = require('cookie');
// Creación de funciones personalizadas
const { esPar, contraseniasCoinciden } = require('../utils/utils');

const userURL = process.env.USER_URL;

const registro = async (req, res) => {
    try {
      const errors = validationResult(req);
  
      // Si hay errores de validación, responde con un estado 400 Bad Request
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
     
      const { nombre, apellidos, email, password, roles } = req.body;
      let photo = req.file ? req.file.filename : null;

      // Verificar si ya existe un usuario con el mismo correo electrónico
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          code: -2,
          message: 'Ya existe un usuario con el mismo correo electrónico'
        });
      }
      
      // Crear un nuevo usuario
      const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
      const newUser = new User({ nombre, apellidos, email, password: hashedPassword, roles: 'user', photo, status: 1 });
      await newUser.save();
  
      // Generar un token de acceso y lo guardo en un token seguro (httpOnly)
      const accessToken = jwt.sign({ id_user: newUser.id_user, nombre: newUser.nombre }, process.env.JWT_SECRET,
      { expiresIn: '2h' });
      const token = serialize('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      res.setHeader('Set-Cookie', token);
  
      // Enviar una respuesta al cliente
      res.status(200).json({
        code: 1,
        message: 'Usuario registrado correctamente',
        accessToken: accessToken,  // Incluye el token
        data: {
          user: {
            id_user: newUser.id_user,
            nombre: newUser.nombre,
            apellidos: newUser.apellidos,
            email: newUser.email,
            roles: newUser.roles,
            photo: newUser.photo,
          }
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: -100,
        message: 'Ha ocurrido un error al registrar el usuario',
        error: error,
      });
    }
};

const login = async (req, res) => {
    try {
      const errors = validationResult(req);
  
      // If there are validation errors, respond with a 400 Bad Request status
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
      console.log('Recibiendo datos:', req.body);
      // Verificar si el correo electrónico y la contraseña son correctos
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          code: -25,
          message: 'user No exist'
        });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          code: -5,
          message: 'Credenciales incorrectas'
        });
      }
  
      // Generar un token de acceso y lo guardo en un token seguro (httpOnly)
      const accessToken = jwt.sign(
        { 
          id_user: user.id_user, 
          nombre: user.nombre,
          roles: user.roles,
          email: user.email
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
  
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7200000
      });
  
      // Enviar una respuesta al cliente
      res.status(200).json({
        code: 1,
        message: 'Login OK',
        data: {
          accessToken: accessToken,
          user: {
            id_user: user.id_user,
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
            roles: user.roles,
            photo: user.photo
          }          
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: -100,
        message: 'Ha ocurrido un error al iniciar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
};

const forgotPassword = async (req, res) => {
    try {
      const errors = validationResult(req);
  
      // If there are validation errors, respond with a 400 Bad Request status
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email } = req.body;
  
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          code: -8,
          message: 'Email does not exist'
        });
      }
  
      let resetToken = crypto.randomBytes(32).toString("hex");
  
      await new RecoveryToken({
        user_id: user.id_user,
        token: resetToken,
        created_at: Date.now(),
      }).save();
  
      const link = `${userURL}/change-password?token=${resetToken}&id=${user.id_user}`;
  
      await sendEmail(
        user.email,
        "Password Reset Request",
        {
          nombre: user.nombre,
          link: link,
        },
        "email/template/requestResetPassword.handlebars"
      ).then(response => {
        console.log("Resultado del envío del correo:", response);
        res.status(200).json({
          code: 100,
          message: 'Send Email OK',
          data: {
            token: resetToken,
            link: link
          }
        });
  
      }, error => {
        console.error (error);
        res.status(200).json({
          code: -80,
          message: 'Send Email KO',
          data: {error}
        });
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: -100,
        message: 'Ha ocurrido un error al actualizar el usuario',
        error: error
      });
    }
};

const changePassword = async (req, res) => {
    try {
      const errors = validationResult(req);
  
      // If there are validation errors, respond with a 400 Bad Request status
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { token, password } = req.body;
  
      //Reviso si el Token existe
      let token_row = await RecoveryToken.findOne({ where: { token } });
      if (!token_row) {
        return res.status(404).json({
          code: -3,
          message: 'Token Incorrecto'
        });
      } 
  
      // Buscar un usuario por su ID en la base de datos
      const user = await User.findOne({ where: { id_user: token_row.user_id } });
      if (!user) {
        return res.status(404).json({
          code: -10,
          message: 'Usuario no encontrado'
        });
      }
  
      // Actualizar la contraseña del usuario
      user.password = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
      await user.save();
  
      // Elimino el token
      await RecoveryToken.destroy({
        where: {
          user_id: token_row.user_id
        }
      });
  
      // Generar un token de acceso y lo guardo en un token seguro (httpOnly)
      const accessToken = jwt.sign({ id_user: user.id_user, nombre: user.nombre }, process.env.JWT_SECRET);
      const token_jwt = serialize('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      res.setHeader('Set-Cookie', token_jwt);
  
      // Enviar una respuesta al cliente
      res.status(200).json({
        code: 1,
        message: 'User Detail',
        data: {
          user: {
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email
          } 
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: -100,
        message: 'Ha ocurrido un error al actualizar el usuario',
        error: error
      });
    }
};

const logout = async (req, res) => {
    const { cookies } = req;
    const jwt = cookies.token;
  
    const token = serialize('token', null, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: -1,
      path: '/',
    });
    res.setHeader('Set-Cookie', token);
    res.status(200).json({
      code: 0,
      message: 'Logged out - Delete Token',
    });
};

module.exports = {
  registro,
  login,
  forgotPassword,
  changePassword,
  logout
};
