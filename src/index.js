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

dotenv.config();
const app = express();

// Configura el middleware CORS para que peuda recibir solicitudes de POST, PUT, DELETE, UPDATE, etc.
app.use(cors({
  origin: [
    'https://uruguayosenespanya.com',
    'http://uruguayosenespanya.com',
    'http://localhost:4200',
    'https://localhost:4200'
  ],
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

app.use('/assets/img', express.static(path.join(__dirname, '/uploads')));
app.use(express.static(path.resolve(__dirname)));

// Configurar rutas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/test', testRoutes);
app.use('/api/negocios', negociosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/posts', blogRoutes);
app.use('/api/graficos', graficoRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en ejecución en http://0.0.0.0:${PORT}`);
});
