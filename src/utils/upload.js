const multer = require('multer');
const path = require('path');
const { ensureDirectoryExists } = require("./fileUtils");
const logger = require("../config/logger");

// Garante que o diretório de uploads existe
const uploadDir = path.join(__dirname, "../../Arquivos_gerados/uploads");
ensureDirectoryExists(uploadDir);
logger.info(`Diretório de uploads garantido: ${uploadDir}`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["text/csv", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      logger.warn(`Tipo de arquivo não permitido: ${file.mimetype}`);
      return cb(new Error("Apenas arquivos CSV e PDF são permitidos."));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

module.exports = upload;