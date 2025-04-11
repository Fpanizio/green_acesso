const express = require("express");
const router = express.Router();
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const upload = require("../utils/upload");
const { Boleto } = require("../models/Index");
const PdfParse = require("pdf-parse");
const { ensureDirectoryExists } = require("../utils/fileUtils");
const logger = require("../config/logger");

router.post("/processar-pdf", upload.single("pdf"), async (req, res) => {
  logger.info("Recebendo requisição para processar PDF.");
  if (!req.file) {
    logger.warn("Nenhum PDF enviado.");
    return res.status(400).json({ error: "Nenhum PDF enviado." });
  }

  try {
    // 1. Ler o PDF enviado
    const pdfBuffer = fs.readFileSync(req.file.path);

    //verifica se o pdf é válido
    if (!pdfBuffer || pdfBuffer.length === 0) {
      logger.warn("PDF inválido ou vazio.");
      return res.status(400).json({ error: "PDF inválido ou vazio." });
    }

    // 2. Extrair texto de cada página (usando pdf-parse)
    const data = await PdfParse(pdfBuffer);
    const nomes = data.text.split("\n").filter((nome) => nome.trim() !== "");

    // 3. Buscar todos os boletos no banco para mapear nomes -> ids
    const boletos = await Boleto.findAll();
    const nomeParaId = {};
    boletos.forEach((boleto) => {
      nomeParaId[boleto.nome_sacado.trim().toUpperCase()] = boleto.id;
    });

    // 4. Criar pasta de saída (se não existir)
    const boletosDir = path.join(__dirname, "../../Arquivos_gerados/boletos");
    ensureDirectoryExists(boletosDir);

    // 5. Carregar o PDF original para dividir as páginas (usando pdf-lib)
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    // 6. Verificar se o número de páginas corresponde aos nomes extraídos
    if (pages.length !== nomes.length) {
      const errorMsg = "Número de páginas não corresponde aos nomes extraídos.";
      logger.warn(errorMsg);
      return res.status(400).json({
        error: errorMsg,
      });
    }

    // 7. Dividir o PDF em arquivos individuais
    for (let i = 0; i < pages.length; i++) {
      const nome = nomes[i].trim().toUpperCase();
      const idBoleto = nomeParaId[nome];

      if (!idBoleto) {
        logger.warn(`Nome não encontrado no banco: ${nome}`);
        continue;
      }

      const newPdfDoc = await PDFDocument.create();
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);

      const newPdfBytes = await newPdfDoc.save();
      fs.writeFileSync(path.join(boletosDir, `${idBoleto}.pdf`), newPdfBytes);
      logger.info(`PDF gerado para o boleto ID: ${idBoleto}`);
    }

    // 8. Remover o PDF temporário
    fs.unlinkSync(req.file.path);
    logger.info("Arquivo PDF temporário removido.");

    res.json({ success: true, message: "PDFs divididos com sucesso." });
  } catch (error) {
    logger.error("Erro ao processar PDF.", error);
    res.status(500).json({ error: `Erro ao processar PDF: ${error.message}` });
  }
});

module.exports = router;
