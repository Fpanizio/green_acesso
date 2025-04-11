const fs = require("fs");
const logger = require("../config/logger");

function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Diretório criado: ${dirPath}`);
    }
  } catch (error) {
    logger.error(`Falha ao criar diretório ${dirPath}`, error);
    throw error;
  }
}

module.exports = { ensureDirectoryExists };
