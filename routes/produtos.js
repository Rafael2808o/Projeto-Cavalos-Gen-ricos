// routes/produtos.js
import express from 'express';
import BD from '../db.js';

const router = express.Router();

// LISTAR PRODUTOS
router.get('/', async (req, res) => {
  try {
    const result = await BD.query('SELECT * FROM produtos ORDER BY nome');
    res.render('produtos/listar', { produtos: result.rows });
  } catch (erro) {
    console.log('Erro ao listar produtos', erro);
    res.render('produtos/listar', { produtos: [], mensagem: erro.message });
  }
});

// FORMULÁRIO DE CRIAÇÃO (GET)
router.get('/novo', (req, res) => {
  res.render('produtos/criar');
});

// CRIAR PRODUTO (POST)
router.post('/novo', async (req, res) => {
  const { nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria } = req.body;
  console.log(nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria);

  try {
    await BD.query(
      `INSERT INTO produtos(nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria]
    );

    res.redirect('/produtos');
  } catch (erro) {
    console.log('Erro ao criar produto', erro);
    res.render('produtos/criar', { mensagem: 'Erro ao salvar o produto' });
  }
});

// EDITAR PRODUTO (GET)
router.get('/:id/editar', async (req, res) => {
  const { id } = req.params;
 
  try {
    const resultado = await BD.query('SELECT * FROM produtos WHERE id_produto = $1', [id]);
    res.render('produtos/editar', { produto: resultado.rows[0] });
  } catch (erro) {
    console.log('Erro ao carregar produto', erro);
    res.redirect('/produtos');
  }
});

// EDITAR PRODUTO (POST)
router.post('/:id/editar', async (req, res) => {
  const { id } = req.params;
  const { nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria } = req.body;

  try {
    await BD.query(
      `UPDATE produtos
       SET nome = $1, estoque_minimo = $2, quantidade = $3, valor_custo = $4,
           descricao = $5, data_cadastro = $6, imagem = $7, id_categoria = $8
       WHERE id_produto = $9`,
      [nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria, id]
    );

    res.redirect('/produtos');
  } catch (erro) {
    console.log('Erro ao atualizar produto', erro);
    res.redirect('/produtos');
  }
});

// EXCLUIR PRODUTO
router.post('/:id/deletar', async (req, res) => {
  const { id } = req.params;

  try {
    await BD.query('DELETE FROM produtos WHERE id_produto = $1', [id]);
    res.redirect('/produtos');
  } catch (erro) {
    console.log('Erro ao excluir produto', erro);
    res.redirect('/produtos');
  }
});

router.get('/suplementos', async (req, res) => {
  try {
    const result = await BD.query('SELECT * FROM produtos ORDER BY nome');
    res.render('produtos/suplementos', { produtos: result.rows });
  } catch (erro) {
    console.log('Erro ao carregar suplementos', erro);
    res.render('produtos/suplementos', { produtos: [], mensagem: erro.message });
  }
});

export default router;  