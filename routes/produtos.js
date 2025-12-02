// produtos.js
import express from 'express';
import BD from '../db.js';

const router = express.Router();

// Listar produtos no painel admin
router.get('/', async (req, res) => {
  try {
    const result = await BD.query('SELECT * FROM produtos ORDER BY nome');
    res.render('produtos/listar', { produtos: result.rows });
  } catch (erro) {
    console.log('Erro ao listar produtos', erro);
    res.render('produtos/listar', { produtos: [], mensagem: erro.message });
  }
});

// 🔥 Rota pública para suplementos (SEU suplementos.ejs)
router.get('/suplementos', async (req, res) => {
  try {
    const result = await BD.query('SELECT * FROM produtos ORDER BY nome');
    res.render('produtos/suplementos', { produtos: result.rows });
  } catch (erro) {
    console.log('Erro ao carregar suplementos', erro);
    res.render('produtos/suplementos', { produtos: [], mensagem: erro.message });
  }
});

// Criar produto - GET
router.get('/novo', async (req, res) => {
  try {
    const categorias = await BD.query('SELECT * FROM categorias ORDER BY nome_categoria');
    res.render('produtos/criar', { categorias: categorias.rows });
  } catch (erro) {
    console.log('Erro ao carregar categorias', erro);
    res.render('produtos/criar', { categorias: [] });
  }
});

// Criar produto - POST
router.post('/novo', async (req, res) => {
  const { nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria } = req.body;

  try {
    await BD.query(
      `INSERT INTO produtos(nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nome, estoque_minimo, quantidade, valor_custo, descricao, data_cadastro, imagem, id_categoria]
    );
    res.redirect('/produtos');
  } catch (erro) {
    console.log('Erro ao criar produto', erro);
    const categorias = await BD.query('SELECT * FROM categorias ORDER BY nome_categoria');
    res.render('produtos/criar', { categorias: categorias.rows, mensagem: 'Erro ao salvar o produto' });
  }
});

// Editar produto - GET
router.get('/:id/editar', async (req, res) => {
  const { id } = req.params;

  try {
    const resultadoProduto = await BD.query('SELECT * FROM produtos WHERE id_produto = $1', [id]);
    const resultadoCategorias = await BD.query('SELECT * FROM categorias ORDER BY nome_categoria');

    if (resultadoProduto.rows.length === 0) return res.redirect('/produtos');

    res.render('produtos/editar', {
      produto: resultadoProduto.rows[0],
      categorias: resultadoCategorias.rows
    });
  } catch (erro) {
    console.log('Erro ao carregar produto/categorias', erro);
    res.redirect('/produtos');
  }
});

// Editar produto - POST
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

// Deletar produto
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

export default router;
