const express = require("express");
const { sequelize, ensureDatabaseExists } = require("./config/database");
const logger = require("./config/logger");
const csvRoutes = require("./routes/csvRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const reportRoutes = require("./routes/reportRoutes");
const boletoRoutes = require("./routes/boletoRoute");
const Lote = require("./models/Lote");

const app = express();

logger.info("=========== INICIANDO NOVA EXECUÇÃO ===========");

app.use(express.json());
app.use("/api", csvRoutes);
app.use("/api", pdfRoutes);
app.use("/api", reportRoutes);
app.use("/api", boletoRoutes);

(async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.sync({ force: false });
    logger.info("Banco de dados sincronizado.");

    // Adicionando lotes iniciais, se não existirem
    const lotesIniciais = [
      { nome: "0017", ativo: true },
      { nome: "0018", ativo: true },
      { nome: "0019", ativo: true },
    ];

    for (const lote of lotesIniciais) {
      const [loteCriado, created] = await Lote.findOrCreate({
        where: { nome: lote.nome },
        defaults: lote,
      });
      if (created) {
        logger.info(`Lote criado: ${loteCriado.nome}`);
      }
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Erro ao iniciar o servidor.", error);
  }
})();

module.exports = app;
