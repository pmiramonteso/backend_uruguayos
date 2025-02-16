const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');
const User = require('./userModel.js');

const RecoveryToken = sequelize.define('RecoveryToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER(5).UNSIGNED,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'recoverytokens',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'token']
    }
  ]
});

User.hasMany(RecoveryToken, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
RecoveryToken.belongsTo(User, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = RecoveryToken;
