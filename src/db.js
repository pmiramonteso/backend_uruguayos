const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER_NAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST_NAME,
    dialect: 'mysql',
    logging: false,
  }
);

// Las tablas ya existen (proj_uruguayos.sql). Antes se hacía sequelize.sync({ alter: true }) en cada
// arranque, y eso añadía un índice único duplicado sobre users.email cada vez (llegó a 63 de 64 posibles).
// Para una base vacía: DB_SYNC=true en el .env crea las tablas que falten, sin modificar las que existen.
const syncroModel = async () => {
  if (process.env.DB_SYNC !== 'true') return;
  try {
    await sequelize.sync();
    console.log('Tablas creadas (las que faltaban)');
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  }
};

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await syncroModel();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
