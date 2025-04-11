const fs = require("fs");

function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Diretório criado: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Falha ao criar diretório ${dirPath}`, error);
    throw error;
  }
}

module.exports = { ensureDirectoryExists };