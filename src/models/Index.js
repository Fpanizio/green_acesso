const sequelize = require('../config/database');
const logger = require("../config/logger");
const Lote = require('./Lote');
const Boleto = require('./Boleto');

Boleto.belongsTo(Lote, { foreignKey: 'id_lote' });
Lote.hasMany(Boleto, { foreignKey: 'id_lote' });

logger.info("Associações entre modelos configuradas.");

module.exports = {
  sequelize,
  Lote,
  Boleto,
};