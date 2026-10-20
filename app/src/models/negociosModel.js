const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Negocios = sequelize.define('negocios', {
    id_negocio: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: {
        type:DataTypes.STRING,
        allowNull: true
    },
    latitud: {
        type: DataTypes.DECIMAL(10,8),
        allowNull: true
    },
    longitud: {
        type: DataTypes.DECIMAL(11,8),
        allowNull: true
    },
    tipoRedSocial: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    urlRedSocial: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'negocios',
  timestamps: false
})

module.exports = Negocios;