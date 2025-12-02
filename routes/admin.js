import express from 'express';
import BD from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Total de produtos
    const totalProdutos = Number((await BD.query('SELECT COUNT(*) AS total FROM produtos')).rows[0].total);

    // 2. Valor total do estoque (custo)
    const valorTotalEstoque = Number(
      (await BD.query('SELECT COALESCE(SUM(quantidade * valor_custo), 0) AS valor_total FROM produtos')).rows[0].valor_total
    );

    // 3. Produtos em alerta (quantidade <= estoque_minimo)
    const alertaResult = await BD.query(`
      SELECT COUNT(*) AS total_produtos
      FROM produtos
      WHERE quantidade <= estoque_minimo
    `);
    const produtosEmAlerta = Number(alertaResult.rows[0].total_produtos);

    // 4. LISTA DOS PRODUTOS COM ESTOQUE BAIXO (para exibir no card)
    const listaEstoqueBaixo = (await BD.query(`
      SELECT
        p.nome AS nome_produto,
        p.quantidade AS quantidade_estoque,
        p.estoque_minimo,
        COALESCE(c.nome_categoria, 'Sem categoria') AS nome_categoria
      FROM produtos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.quantidade <= p.estoque_minimo
      ORDER BY p.quantidade ASC, p.nome
    `)).rows;

    // 5. Produtos por categoria (gráfico)
    const produtosPorCategoria = (await BD.query(`
      SELECT
        c.nome_categoria,
        COALESCE(COUNT(p.id_produto), 0) AS total_produtos
      FROM categorias c
      LEFT JOIN produtos p ON p.id_categoria = c.id_categoria
      GROUP BY c.nome_categoria
      ORDER BY c.nome_categoria
    `)).rows;

    // Renderiza o dashboard com todos os dados corretos
    res.render('admin/dashboard', {
      totalProdutos,
      valorTotalEstoque,
      produtosEmAlerta,
      listaEstoqueBaixo,           // ← ESSA É A LISTA QUE VAI APARECER NO CARD
      produtosPorCategoria
    });

  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

export default router;