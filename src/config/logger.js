const fs = require("fs");
const path = require("path");
const { ensureDirectoryExists } = require("../utils/fileUtils");

// Cria pasta de logs se não existir
const logDir = path.join(__dirname, "../../logs");
ensureDirectoryExists(logDir);

const logStream = fs.createWriteStream(
  path.join(logDir, `app-${new Date().toISOString().split("T")[0]}.log`),
  { flags: "a" } // 'a' para append (adicionar ao arquivo existente)
);

const logger = {
  info: (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()} - ${message}\n`;
    logStream.write(logMessage);
    console.log(logMessage.trim());
  },
  error: (message, error) => {
    const errorDetails = error ? `: ${error.message}\n${error.stack}` : "";
    const logMessage = `[ERROR] ${new Date().toISOString()} - ${message}${errorDetails}\n`;
    logStream.write(logMessage);
    console.error(logMessage.trim());
  },
  warn: (message) => {
    const logMessage = `[WARN] ${new Date().toISOString()} - ${message}\n`;
    logStream.write(logMessage);
    console.warn(logMessage.trim());
  },
};

module.exports = logger;
