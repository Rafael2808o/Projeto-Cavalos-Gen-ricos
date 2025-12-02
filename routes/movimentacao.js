import express from 'express';
import BD from '../db.js';

const router = express.Router();

// ============================
// Lista todas as movimentações
// ============================
router.get('/', async (req, res) => {
  const { busca, ordenar_por, direcao } = req.query;

  try {
    const queryParams = [];
    let query = `
      SELECT 
        m.id_mov,
        m.id_produto,
        p.nome AS produto_nome,
        m.tipo,
        m.quantidade,
        COALESCE(m.observacao, '-') AS descricao,
        TO_CHAR(m.data_mov, 'DD/MM/YYYY, HH24:MI:SS') AS data_formatada,
        COALESCE(u.nome, 'Desconhecido') AS usuario_nome
      FROM movimentacao_estoque m
      JOIN produtos p ON m.id_produto = p.id_produto
      LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
    `;

    if (busca) {
      query += ` WHERE p.nome ILIKE $1 `;
      queryParams.push(`%${busca}%`);
    }

    const ordenarColuna = ['data_mov','produto_nome','tipo','quantidade'].includes(ordenar_por) ? ordenar_por : 'data_mov';
    const direcaoOrdenacao = direcao === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${ordenarColuna} ${direcaoOrdenacao}`;

    const result = await BD.query(query, queryParams);
    const produtos = await BD.query('SELECT id_produto, nome FROM produtos ORDER BY nome');

    res.render('movimentacao/index', {
      titulo: 'Movimentações',
      movimentacoes: result.rows,
      produtos: produtos.rows,
      busca: busca || '',
      ordenar_por: ordenarColuna,
      direcao: direcaoOrdenacao
    });

  } catch (erro) {
    console.error('Erro ao carregar movimentações:', erro);
    res.render('movimentacao/index', {
      titulo: 'Movimentações',
      movimentacoes: [],
      produtos: [],
      busca: '',
      ordenar_por: 'data_mov',
      direcao: 'DESC'
    });
  }
});

// ============================
// Abrir formulário de criação
// ============================
router.get('/criar', async (req, res) => {
  try {
    const produtos = await BD.query('SELECT id_produto, nome FROM produtos ORDER BY nome');

    res.render('movimentacao/form', {
      pageTitle: 'Registrar Movimentação',
      action: '/movimentacao/registrar',
      produtos: produtos.rows,
      movimentacao: null
    });
  } catch (erro) {
    console.error('Erro ao abrir formulário:', erro);
    res.redirect('/movimentacao');
  }
});

// ============================
// Registrar nova movimentação
// ============================
router.post('/registrar', async (req, res) => {
  const { produto_id, tipo, quantidade, descricao } = req.body;

  const usuarioId = req.session?.idUsuario;
  if(!usuarioId) {
    console.log('Sessão inválida:', req.session);
    return res.status(401).send('Usuário não logado');
  }

  try {
    const produtoIdNum = parseInt(produto_id, 10);
    const quantidadeNum = parseInt(quantidade, 10);

    if (!produtoIdNum || !quantidadeNum || !tipo) {
      return res.status(400).send('Campos inválidos');
    }

    let tipoVal = tipo.trim();
    if (tipoVal.toLowerCase() === 'entrada') tipoVal = 'Entrada';
    else if (tipoVal.toLowerCase() === 'saída' || tipoVal.toLowerCase() === 'saida') tipoVal = 'Saída';
    else return res.status(400).send('Tipo inválido');

    const sinal = tipoVal === 'Entrada' ? '+' : '-';

    await BD.query(`
      UPDATE produtos
      SET quantidade = quantidade ${sinal} $1
      WHERE id_produto = $2
    `, [quantidadeNum, produtoIdNum]);

    await BD.query(`
      INSERT INTO movimentacao_estoque 
        (id_produto, tipo, quantidade, observacao, data_mov, id_usuario)
      VALUES ($1, $2, $3, $4, NOW(), $5)
    `, [produtoIdNum, tipoVal, quantidadeNum, descricao || null, usuarioId]);

    res.redirect('/movimentacao');

  } catch (erro) {
    console.error('Erro ao registrar movimentação:', erro);
    res.status(500).send('Erro ao registrar movimentação');
  }
});

// ============================
// Abrir formulário de edição
// ============================
router.get('/editar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await BD.query(`
      SELECT * FROM movimentacao_estoque WHERE id_mov = $1
    `, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).send('Movimentação não encontrada');
    }

    const movimentacao = resultado.rows[0];
    const produtos = await BD.query('SELECT id_produto, nome FROM produtos ORDER BY nome');

    res.render('movimentacao/form', {
      pageTitle: 'Editar Movimentação',
      action: `/movimentacao/editar/${id}`,
      produtos: produtos.rows,
      movimentacao
    });

  } catch (erro) {
    console.error('Erro ao abrir formulário de edição:', erro);
    res.status(500).send('Erro ao abrir formulário de edição');
  }
});

// ============================
// Salvar edição da movimentação
// ============================
router.post('/editar/:id', async (req, res) => {
  const { id } = req.params;
  const { produto_id, tipo, quantidade, descricao } = req.body;

  const usuarioId = req.session?.idUsuario;
  if(!usuarioId) return res.status(401).send('Usuário não logado');

  try {
    const movAtual = await BD.query('SELECT * FROM movimentacao_estoque WHERE id_mov = $1', [id]);
    if (movAtual.rows.length === 0) return res.status(404).send('Movimentação não encontrada');

    const mov = movAtual.rows[0];

    const sinalUndo = mov.tipo.toLowerCase() === 'entrada' ? '-' : '+';
    await BD.query(`
      UPDATE produtos
      SET quantidade = quantidade ${sinalUndo} $1
      WHERE id_produto = $2
    `, [mov.quantidade, mov.id_produto]);

    const quantidadeNum = parseInt(quantidade, 10);
    let tipoVal = tipo.trim();
    if (tipoVal.toLowerCase() === 'entrada') tipoVal = 'Entrada';
    else if (tipoVal.toLowerCase() === 'saída' || tipoVal.toLowerCase() === 'saida') tipoVal = 'Saída';
    else return res.status(400).send('Tipo inválido');

    const sinalNew = tipoVal === 'Entrada' ? '+' : '-';
    await BD.query(`
      UPDATE produtos
      SET quantidade = quantidade ${sinalNew} $1
      WHERE id_produto = $2
    `, [quantidadeNum, parseInt(produto_id, 10)]);

    await BD.query(`
      UPDATE movimentacao_estoque
      SET id_produto=$1, tipo=$2, quantidade=$3, observacao=$4
      WHERE id_mov=$5
    `, [parseInt(produto_id,10), tipoVal, quantidadeNum, descricao || null, id]);

    res.redirect('/movimentacao');

  } catch (erro) {
    console.error('Erro ao salvar edição:', erro);
    res.status(500).send('Erro ao salvar edição');
  }
});

// ============================
// Excluir movimentação
// ============================
router.post('/deletar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const mov = await BD.query(`
      SELECT id_produto, tipo, quantidade 
      FROM movimentacao_estoque 
      WHERE id_mov = $1
    `, [id]);

    if (mov.rows.length === 0) return res.status(404).send('Movimentação não encontrada');

    const { id_produto, tipo, quantidade } = mov.rows[0];
    const sinal = tipo.toLowerCase() === 'entrada' ? '-' : '+';

    await BD.query(`
      UPDATE produtos 
      SET quantidade = quantidade ${sinal} $1 
      WHERE id_produto = $2
    `, [quantidade, id_produto]);

    await BD.query('DELETE FROM movimentacao_estoque WHERE id_mov = $1', [id]);

    res.redirect('/movimentacao');
  } catch (erro) {
    console.error('Erro ao excluir movimentação:', erro);
    res.status(500).send('Erro ao excluir movimentação');
  }
});

export default router;
