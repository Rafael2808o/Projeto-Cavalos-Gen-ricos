import express from 'express';
import BD from '../db.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {

    const result = await BD.query('SELECT * FROM usuarios ORDER BY nome');
    res.render('usuarios/listar', { usuarios: result.rows });
  } catch (erro) {
    console.log('Erro ao listar usuario', erro);
    res.render('usuarios/listar', { usuarios: [], mensagem: erro.message || (erro) });
  }
});

router.get('/novo', (req, res) => {
  res.render('usuarios/criar');
});

router.post('/novo', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    await BD.query('INSERT INTO usuarios (nome, email, senha, ativo) VALUES ($1, $2, $3, true)', [nome, email, senha]);
    res.redirect('/usuarios');
  } catch (erro) {
    console.log('Erro ao criar usuario', erro);
    res.render('usuarios/criar', { mensagem: 'Erro ao salvar um usuario' });
  }
});


router.get('/:id/editar', async (req, res) => {
  const { id } = req.params;

console.log(id)

  try {
    const resultado = await BD.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
   
    console.log(resultado.rows[0])
   
    res.render('usuarios/editar', { usuarios: resultado.rows[0] });
  } catch (erro) {
    console.log('Erro ao carregar usuario', erro);
    res.redirect('/usuarios');
  }
});


router.post('/:id/editar', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;
  try {
    await BD.query('UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id_usuario = $4', [nome,email,senha,id]);
    res.redirect('/usuarios');
  } catch (erro) {
    console.log('Erro ao atualizar usuario', erro);
    res.redirect('/usuarios');
  }
});


router.post('/:id/deletar', async (req, res) => {
  const { id } = req.params;
  try {
    await BD.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
    res.redirect('/usuarios');
  } catch (erro) {
    console.log('Erro ao excluir usuario', erro);
    res.redirect('/usuarios');
  }
});

export default router;