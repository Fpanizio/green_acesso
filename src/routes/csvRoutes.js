const express = require("express");
const router = express.Router();
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const upload = require("../utils/upload");
const { Lote, Boleto } = require("../models/Index");
const logger = require("../config/logger");

router.post("/importar-csv", upload.single("csv"), async (req, res) => {
  logger.info("Recebendo requisição para importar CSV.");
  if (!req.file) {
    logger.warn("Nenhum arquivo CSV enviado.");
    return res.status(400).json({ error: "Nenhum arquivo CSV enviado." });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csvParser({ separator: ";" }))
    .on("data", (data) => {
      if (!data.nome || !data.unidade || !data.valor || !data.linha_digitavel) {
        const errorMsg = `Linha inválida no CSV: ${JSON.stringify(data)}`;
        logger.warn(errorMsg);
        errors.push(errorMsg);
        return;
      }

      if (isNaN(parseFloat(data.valor)) || parseFloat(data.valor) <= 0) {
        const errorMsg = `Valor inválido na linha: ${JSON.stringify(data)}`;
        logger.warn(errorMsg);
        errors.push(errorMsg);
        return;
      }

      if (
        results.some((item) => item.linha_digitavel === data.linha_digitavel)
      ) {
        const errorMsg = `Linha duplicada no CSV: ${data.linha_digitavel}`;
        logger.warn(errorMsg);
        errors.push(errorMsg);
        return;
      }

      results.push(data);
    })
    .on("end", async () => {
      logger.info(`Processando ${results.length} registros do CSV.`);
      const boletosProcessados = [];

      for (const item of results) {
        try {
          const unidadeFormatada = item.unidade.padStart(4, "0");
          const lote = await Lote.findOne({
            where: { nome: unidadeFormatada },
          });

          if (!lote) {
            const errorMsg = `Lote não encontrado para a unidade: ${item.unidade}`;
            logger.warn(errorMsg);
            errors.push(errorMsg);
            continue;
          }

          boletosProcessados.push({
            nome_sacado: item.nome,
            id_lote: lote.id,
            valor: parseFloat(item.valor),
            linha_digitavel: item.linha_digitavel,
            ativo: true,
          });
        } catch (error) {
          const errorMsg = `Erro ao processar unidade ${item.unidade}: ${error.message}`;
          logger.error(errorMsg, error);
          errors.push(errorMsg);
        }
      }

      if (boletosProcessados.length > 0) {
        try {
          await Boleto.bulkCreate(boletosProcessados, {
            ignoreDuplicates: true,
          });
          logger.info(
            `${boletosProcessados.length} boletos importados com sucesso.`
          );
        } catch (error) {
          const errorMsg = `Erro ao salvar boletos no banco: ${error.message}`;
          logger.error(errorMsg, error);
          errors.push(errorMsg);
        }
      }

      fs.unlinkSync(req.file.path);
      logger.info("Arquivo CSV temporário removido.");

      res.json({
        success: boletosProcessados.length > 0,
        imported: boletosProcessados.length,
        errors: errors.length > 0 ? errors : null,
      });
    })
    .on("error", (error) => {
      logger.error("Erro ao processar o CSV.", error);
      res.status(500).json({ error: "Erro ao processar o CSV." });
    });
});

module.exports = router;
