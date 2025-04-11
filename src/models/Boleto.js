const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const logger = require("../config/logger");

const Boleto = sequelize.define(
  "Boleto",
  {
    nome_sacado: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "O nome do sacado não pode ser vazio." },
      },
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "O valor deve ser um número decimal válido." },
      },
    },
    linha_digitavel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: "A linha digitável deve ser única.",
      },
      validate: {
        notEmpty: { msg: "A linha digitável não pode ser vazia." },
      },
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
