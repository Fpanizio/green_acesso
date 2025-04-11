const { Sequelize } = require("sequelize");
const { Client } = require("pg");
const logger = require("./logger");
require("dotenv").config();

const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
};

async function ensureDatabaseExists() {
  const client = new Client({
    user: dbConfig.username,
    host: dbConfig.host,
    password: dbConfig.password,
    port: dbConfig.port,
  });

  try {
    await client.connect();
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`
    );

    if (result.rowCount === 0) {
      logger.info(`Banco de dados '${dbConfig.database}' não encontrado. Criando...`);
      await client.query(`CREATE DATABASE ${dbConfig.database}`);
      logger.info(`Banco de dados '${dbConfig.database}' criado com sucesso.`);
    } else {
      logger.info(`Banco de dados '${dbConfig.database}' já existe.`);
    }
  } catch (error) {
    logger.error("Erro ao verificar/criar o banco de dados.", error);
    throw error;
  } finally {
    await client.end();
  }
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

module.exports = { sequelize, ensureDatabaseExists };
