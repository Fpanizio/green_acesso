const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Lote, Boleto } = require("../models/Index");
const { ensureDirectoryExists } = require("../utils/fileUtils");
const logger = require("../config/logger");

const relatoriosDir = path.join(__dirname, "../../Arquivos_gerados/relatorios");
ensureDirectoryExists(relatoriosDir);

router.get("/relatorio", async (req, res) => {
  logger.info("Recebendo requisição para gerar relatório.");
  try {
    const boletos = await Boleto.findAll({
      include: [{ model: Lote, attributes: ["nome"] }],
    });

    if (req.query.relatorio === "1") {
      logger.info("Gerando relatório em PDF.");
      const doc = new PDFDocument();
      const dataAtual = new Date();
      const dataFormatada = dataAtual.toISOString().split("T")[0];
      const horarioFormatado = dataAtual
        .toTimeString()
        .split(" ")[0]
        .replace(/:/g, "-");
      const filename = `relatorio_boletos_${dataFormatada}_${horarioFormatado}.pdf`;
      const filePath = path.join(relatoriosDir, filename);

      const fileStream = fs.createWriteStream(filePath);
      doc.pipe(fileStream);

      doc.fontSize(14).text("Relatório de Boletos", { align: "center" });
      doc.moveDown();

      const boletosFormatados = boletos.map((boleto) => ({
        ...boleto.get({ plain: true }),
        valor: parseFloat(boleto.valor),
      }));

      const headers = ["ID", "Nome", "Lote", "Valor (R$)", "Linha Digitável"];
      const rows = boletosFormatados.map((boleto) => [
        boleto.id,
        boleto.nome_sacado,
        boleto.Lote.nome,
        boleto.valor.toFixed(2),
        boleto.linha_digitavel,
      ]);

      const startY = 100;
      const margin = 50;
      const rowHeight = 30;
      const colWidths = [50, 150, 100, 100, doc.page.width - 2 * margin - 400];

      doc.font("Helvetica-Bold").fontSize(10);
      headers.forEach((header, i) => {
        const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(header, x, startY, {
          width: colWidths[i],
          align: "left",
        });
      });

      doc.font("Helvetica").fontSize(8);
      rows.forEach((row, rowIndex) => {
        const y = startY + (rowIndex + 1) * rowHeight;
        row.forEach((cell, colIndex) => {
          const x =
            margin + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
          doc.text(cell, x, y, {
            width: colWidths[colIndex],
            align: "left",
          });
        });
      });

      doc.end();

      fileStream.on("finish", () => {
        logger.info(`Relatório gerado com sucesso: ${filename}`);

        const pdfBase64 = fs.readFileSync(filePath, { encoding: "base64" });

        logger.info("Retornando relatório em base64.");
        res.json({
          success: true,
          message: "Relatório gerado com sucesso",
          filename: filename,
          base64: pdfBase64,
        });
      });

      fileStream.on("error", (error) => {
        logger.error("Erro ao salvar arquivo.", error);
        throw new Error(`Erro ao salvar arquivo: ${error.message}`);
      });
    } else {
      logger.info("Retornando lista de boletos.");
      res.json(boletos);
    }
  } catch (error) {
    logger.error("Erro ao gerar relatório.", error);
    res
      .status(500)
      .json({ error: `Erro ao gerar relatório: ${error.message}` });
  }
});

module.exports = router;
