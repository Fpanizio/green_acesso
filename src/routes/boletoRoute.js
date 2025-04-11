const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Boleto, Lote } = require('../models/Index');
const logger = require("../config/logger");

// Endpoint GET /boletos com filtros
router.get('/boletos', async (req, res) => {
  logger.info("Recebendo requisição para listar boletos.");
  try {
    const { nome, valor_inicial, valor_final, id_lote } = req.query;

    if (valor_inicial && isNaN(parseFloat(valor_inicial))) {
      logger.warn("Parâmetro valor_inicial inválido.");
      return res.status(400).json({ error: "Parâmetro valor_inicial deve ser numérico." });
    }

    if (valor_final && isNaN(parseFloat(valor_final))) {
      logger.warn("Parâmetro valor_final inválido.");
      return res.status(400).json({ error: "Parâmetro valor_final deve ser numérico." });
    }

    if (id_lote && isNaN(parseInt(id_lote))) {
      logger.warn("Parâmetro id_lote inválido.");
      return res.status(400).json({ error: "Parâmetro id_lote deve ser numérico." });
    }

    const where = {};

    // Filtro por nome (case-insensitive)
    if (nome) {
      where.nome_sacado = {
        [Op.iLike]: `%${nome}%` // iLike para PostgreSQL (case-insensitive)
      };
    }

    // Filtro por ID do lote
    if (id_lote) {
      where.id_lote = parseInt(id_lote);
    }

    // Filtro por faixa de valor
    if (valor_inicial && valor_final) {
      where.valor = {
        [Op.between]: [
          parseFloat(valor_inicial),
          parseFloat(valor_final)
        ]
      };
    } else if (valor_inicial) {
      where.valor = { [Op.gte]: parseFloat(valor_inicial) };
    } else if (valor_final) {
      where.valor = { [Op.lte]: parseFloat(valor_final) };
    }

    const boletos = await Boleto.findAll({
      where,
      include: [{
        model: Lote,
        attributes: ['nome']
      }],
      order: [['id', 'ASC']]
    });

    logger.info("Boletos listados com sucesso.");
    res.json(boletos);

  } catch (error) {
    logger.error("Erro ao buscar boletos.", error);
    res.status(500).json({ 
      error: `Erro ao buscar boletos: ${error.message}` 
    });
  }
});

module.exports = router;