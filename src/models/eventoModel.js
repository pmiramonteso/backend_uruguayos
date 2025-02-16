const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Eventos = sequelize.define('Eventos', {
  id_evento: {
    type: DataTypes.INTEGER(8).UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['pastelVioleta', 'pastelIndig', 'pastelBlue', 'pastelGreen', 'pastelYellow', 'pastelOrange', 'pastelRed']]
    }
  },
  entrada: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Gratuito', // Valor por defecto si no se proporciona
    validate: {
      isIn: [['Gratuito', 'Pago', 'No disponible']] // Valores posibles
    }
  },
  precio: {
    type: DataTypes.DECIMAL,
    allowNull: true, // Solo se proporciona si 'entrada' es 'Pago'
    validate: {
      isDecimal: true, 
      min: 0 // El precio debe ser mayor o igual a 0
    }
  },
  ubicacion: {
    type:DataTypes.STRING,
    allowNull: false
},
photo: {
  type: DataTypes.STRING(255),
  allowNull: true,
}
}, 
{
  tableName: 'eventos',
  timestamps: true
});

module.exports = Eventos;
