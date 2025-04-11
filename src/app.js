const express = require("express");
const { sequelize, Lote, Boleto } = require("./models/Index");
const logger = require("./config/logger");
const app = express();
const csvRoutes = require("./routes/csvRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const reportRoutes = require("./routes/reportRoutes");
const boletoRoutes = require("./routes/boletoRoute");

app.use(express.json());
app.use("/api", csvRoutes);
app.use("/api", pdfRoutes);
app.use("/api", reportRoutes);
app.use("/api", boletoRoutes);

// Sincronizar modelos com o banco de dados
sequelize.sync({ force: false }).then(() => {
  logger.info("Banco de dados sincronizado.");
  criarLotesIniciais();
});

async function criarLotesIniciais() {
  await Lote.bulkCreate([
    { nome: "0017", ativo: true },
    { nome: "0018", ativo: true },
    { nome: "0019", ativo: true },
  ]);
}

app.get("/", (req, res) => {
  logger.info("Requisição recebida na rota raiz.");
  res.send("API Green Acesso Online");
});

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Servidor rodando em http://localhost:${PORT}`);
});
