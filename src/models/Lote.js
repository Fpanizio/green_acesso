const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const logger = require("../config/logger");

const Lote = sequelize.define('Lote', {
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'lotes',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false,
});

logger.info("Modelo Lote definido.");

module.exports = Lote;