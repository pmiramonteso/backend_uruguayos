const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RecoveryToken = require('../models/recoveryTokenModel');
const sendEmail = require("../utils/email/sendEmail");
const { validationResult } = require('express-validator');
const { stringifySetCookie } = require('cookie');
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
      const token = stringifySetCookie({
        name: 'token',
        value: accessToken,
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

// Los enlaces de recuperación caducan a la hora y solo sirven una vez.
// En la base de datos se guarda el hash del token, no el token, por si alguien llegara a leerla.
const VALIDEZ_TOKEN_MS = 60 * 60 * 1000;
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

// La respuesta es la misma exista o no el email, para no revelar quién está registrado
const RESPUESTA_FORGOT = {
  code: 100,
  message: 'Si el email está registrado, te hemos enviado un enlace para cambiar la contraseña'
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
        return res.status(200).json(RESPUESTA_FORGOT);
      }
  
      // Solo un enlace válido por usuario: el nuevo invalida los anteriores
      await RecoveryToken.destroy({ where: { user_id: user.id_user } });

      const resetToken = crypto.randomBytes(32).toString("hex");
      await RecoveryToken.create({
        user_id: user.id_user,
        token: hashToken(resetToken),
        created_at: new Date(),
      });
  
      const link = `${userURL}/change-password?token=${resetToken}`;
  
      try {
        await sendEmail(
          user.email,
          "Cambiar tu contraseña",
          {
            nombre: user.nombre,
            link: link,
          },
          "email/template/requestResetPassword.handlebars"
        );
      } catch (error) {
        console.error('Error al enviar el email de recuperación:', error.message);
      }

      res.status(200).json(RESPUESTA_FORGOT);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: -100,
        message: 'Ha ocurrido un error al solicitar el cambio de contraseña'
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
  
      const token_row = await RecoveryToken.findOne({ where: { token: hashToken(token) } });
      const caducado = token_row && Date.now() - new Date(token_row.created_at).getTime() > VALIDEZ_TOKEN_MS;
      if (!token_row || caducado) {
        if (caducado) {
          await RecoveryToken.destroy({ where: { user_id: token_row.user_id } });
        }
        return res.status(400).json({
          code: -3,
          message: 'El enlace no es válido o ha caducado. Pide uno nuevo.'
        });
      }
  
      const user = await User.findOne({ where: { id_user: token_row.user_id } });
      if (!user) {
        return res.status(404).json({
          code: -10,
          message: 'Usuario no encontrado'
        });
      }
  
      user.password = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
      await user.save();
  
      // El enlace ya se ha usado: se borra para que no sirva otra vez
      await RecoveryToken.destroy({ where: { user_id: user.id_user } });
  
      // Sin inicio de sesión automático: la persona entra con su nueva contraseña desde el login
      res.status(200).json({
        code: 1,
        message: 'Contraseña cambiada. Ya puedes iniciar sesión.'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        code: -100,
        message: 'Ha ocurrido un error al cambiar la contraseña'
      });
    }
};

const logout = async (req, res) => {
    const { cookies } = req;
    const jwt = cookies.token;
  
    const token = stringifySetCookie({
      name: 'token',
      value: '',
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
