import express from 'express';
import BD from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await BD.query('SELECT * FROM categorias ORDER BY nome_categoria');
    res.render('categorias/listar', { categorias: result.rows });
  } catch (erro) {
    console.log('Erro ao listar categoria', erro);
    res.render('categorias/listar', { categorias: [], mensagem: erro.message || (erro) });
  }
});

router.get('/novo', (req, res) => {
  res.render('categorias/criar');
});

router.post('/novo', async (req, res) => {
  const { nome_categoria } = req.body;
  try {
    await BD.query('INSERT INTO categorias (nome_categoria) VALUES ($1)', [nome_categoria]);
    res.redirect('/categorias');
  } catch (erro) {
    console.log('Erro ao criar categoria', erro);
    res.render('categorias/criar', { mensagem: 'Erro ao salvar um categoria' });
  }
});

router.get('/:id/editar', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await BD.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
    res.render('categorias/editar', { categoria: resultado.rows[0] });
  } catch (erro) {
    console.log('Erro ao carregar aluno', erro);
    res.redirect('/categorias');
  }
});

router.post('/:id/editar', async (req, res) => {
  const { id } = req.params;
  const { nome_categoria } = req.body;
  try {
    await BD.query('UPDATE categorias SET nome_categoria = $1 WHERE id_categoria = $2', [nome_categoria, id]);
    res.redirect('/categorias');
  } catch (erro) {
    console.log('Erro ao atualizar categoria', erro);
    res.redirect('/categorias');
  }
});

router.post('/:id/deletar', async (req, res) => {
  const { id } = req.params;
  try {
    await BD.query('DELETE FROM categorias WHERE id_categoria = $1', [id]);
    res.redirect('/categorias');
  } catch (erro) {
    console.log('Erro ao excluir categoria', erro);
    res.redirect('/categorias');
  }
});

export default router;