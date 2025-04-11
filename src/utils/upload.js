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

const upload = multer({ storage: storage });
module.exports = upload;