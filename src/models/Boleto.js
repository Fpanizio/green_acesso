const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const logger = require("../config/logger");

const Boleto = sequelize.define(
  "Boleto",
  {
    nome_sacado: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    linha_digitavel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "boletos",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: false,
  }
);

logger.info("Modelo Boleto definido.");

module.exports = Boleto;
