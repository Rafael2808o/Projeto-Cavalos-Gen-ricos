import express from 'express';
import BD from '../db.js';

const router = express.Router();

const ITENS_POR_PAGINA = 9;

router.get('/', async (req, res) => {
  try {
    let pagina = parseInt(req.query.pagina) || 1;
    if (pagina < 1) pagina = 1;

    const busca = req.query.busca || '';
    const offset = (pagina - 1) * ITENS_POR_PAGINA;

    let sqlCount = 'SELECT COUNT(*) AS total FROM usuarios';
    let sqlData = 'SELECT * FROM usuarios';
    let paramsCount = [];
    let paramsData = [];

    if (busca) {
      const termo = `%${busca.toLowerCase()}%`;
      sqlCount += ' WHERE LOWER(nome) LIKE $1 OR LOWER(email) LIKE $2';
      sqlData += ' WHERE LOWER(nome) LIKE $1 OR LOWER(email) LIKE $2';
      paramsCount = [termo, termo];
      paramsData = [termo, termo];
    }

    const countResult = await BD.query(sqlCount, paramsCount);
    const totalUsuarios = countResult.rows[0].total;
    const totalPaginas = Math.ceil(totalUsuarios / ITENS_POR_PAGINA);

    sqlData += ' ORDER BY nome LIMIT $1 OFFSET $2';
    paramsData.push(ITENS_POR_PAGINA, offset);

    const result = await BD.query(sqlData, paramsData);

    res.render('usuarios/listar', {
      usuarios: result.rows,
      busca: busca,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas: totalPaginas
      }
    });
  } catch (erro) {
    console.log('Erro ao listar usuario', erro);
    res.render('usuarios/listar', { usuarios: [], mensagem: erro.message || erro });
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

  try {
    const resultado = await BD.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
   
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