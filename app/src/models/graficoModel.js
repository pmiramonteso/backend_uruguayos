const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Emigrantes = sequelize.define('emigrantes', {
    id_datos: {
        type: DataTypes.INTEGER(8).UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    año: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    emigrantes_hombres: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    emigrantes_mujeres: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total_emigrantes_mundo: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total_emigrantes_pais: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total_emigrantes_españa: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    nacionalidad_extranjera: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    nacionalidad_española: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    pais_destino: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    provincia_destino: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    total_emigrantes_provincia: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'emigrantes',
    timestamps: false
});

module.exports = Emigrantes;

