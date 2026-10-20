const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');
const negociosRoutes = require('./routes/negociosRoutes');
const eventosRoutes = require('./routes/eventoRoutes');
const blogRoutes = require('./routes/blogRoutes');
const graficoRoutes = require('./routes/graficoRoutes');
const { authenticateToken } = require('./middlewares/authenticateToken.js');
const { testConnection } = require('./db');

dotenv.config({ quiet: true });
const app = express();

// Orígenes permitidos y carpeta del frontend: configurables por entorno (producción/staging).
// CORS_ORIGINS es una lista separada por comas.
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['https://uruguayosenespanya.com', 'http://localhost:4200', 'https://localhost:4200'];
const publicDir = process.env.PUBLIC_DIR || path.resolve(__dirname, '../../public_html');

// Configura el middleware CORS para que peuda recibir solicitudes de POST, PUT, DELETE, UPDATE, etc.
app.use(cors({
  origin: corsOrigins,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true,
}));


app.use(cookieParser());
// Middleware para analizar el cuerpo de las solicitudes con formato JSON
app.use(express.json());
// Middleware para analizar el cuerpo de las solicitudes con datos de formulario
app.use(express.urlencoded({ extended: true })); // Para analizar datos de formularios en el cuerpo de la solicitud

(async () => {
  await testConnection();
})();
const uploadsPath = path.join(__dirname, '/uploads');
console.log('Ruta de uploads:', uploadsPath);

app.use('/assets/img', (req, res, next) => {
  console.log('Solicitando imagen:', req.url);
  console.log('Buscando en:', path.join(uploadsPath, req.url));
  next();
}, express.static(uploadsPath));
app.use(express.static(publicDir));

// Configurar rutas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/test', testRoutes);
app.use('/api/negocios', negociosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/posts', blogRoutes);
app.use('/api/graficos', graficoRoutes);

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});
console.log('🚀 Iniciando servidor...');
// Iniciar el servidor
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en ejecución en http://0.0.0.0:${PORT}`);
  }).on('error', (err) => {
    console.error('Error al iniciar el servidor:', err);
  });
} else {
  // En producción, exportamos la app para Passenger
  module.exports = app;
}
