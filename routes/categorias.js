import express from 'express';
import BD from '../db.js';

const router = express.Router();

const ITENS_POR_PAGINA = 9;

// Listar categorias (COM PAGINAÇÃO E BUSCA)
router.get('/', async (req, res) => {
  try {
    let pagina = parseInt(req.query.pagina) || 1;
    if (pagina < 1) pagina = 1;

    const busca = req.query.busca || '';
    const offset = (pagina - 1) * ITENS_POR_PAGINA;

    let sqlCount = 'SELECT COUNT(*) AS total FROM categorias';
    let sqlData = 'SELECT id_categoria, nome_categoria, descricao FROM categorias';
    let paramsCount = [];
    let paramsData = [];

    if (busca) {
      const termo = `%${busca.toLowerCase()}%`;
      sqlCount += ' WHERE LOWER(nome_categoria) LIKE $1';
      sqlData += ' WHERE LOWER(nome_categoria) LIKE $1';
      paramsCount = [termo];
      paramsData = [termo];
    }

    const countResult = await BD.query(sqlCount, paramsCount);
    const totalCategorias = countResult.rows[0].total;
    const totalPaginas = Math.ceil(totalCategorias / ITENS_POR_PAGINA);

    sqlData += ' ORDER BY nome_categoria LIMIT $1 OFFSET $2';
    paramsData.push(ITENS_POR_PAGINA, offset);

    const result = await BD.query(sqlData, paramsData);

    res.render('categorias/listar', {
      categorias: result.rows,
      busca: busca,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas: totalPaginas
      }
    });
  } catch (erro) {
    console.log('Erro ao listar categoria', erro);
    res.render('categorias/listar', { categorias: [], mensagem: erro.message || erro });
  }
});

// Formulário de criação
router.get('/novo', (req, res) => {
  res.render('categorias/criar');
});

// Criar categoria
router.post('/novo', async (req, res) => {
  const { nome_categoria, descricao } = req.body;
  try {
    await BD.query('INSERT INTO categorias (nome_categoria, descricao) VALUES ($1, $2)', [nome_categoria, descricao]);
    res.redirect('/categorias');
  } catch (erro) {
    console.log('Erro ao criar categoria', erro);
    res.render('categorias/criar', { mensagem: 'Erro ao salvar a categoria' });
  }
});

// Formulário de edição
router.get('/:id/editar', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await BD.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
    res.render('categorias/editar', { categoria: resultado.rows[0] });
  } catch (erro) {
    console.log('Erro ao carregar categoria', erro);
    res.redirect('/categorias');
  }
});

// Atualizar categoria
router.post('/:id/editar', async (req, res) => {
  const { id } = req.params;
  const { nome_categoria, descricao } = req.body;
  try {
    await BD.query(
      'UPDATE categorias SET nome_categoria = $1, descricao = $2 WHERE id_categoria = $3',
      [nome_categoria, descricao, id]
    );
    res.redirect('/categorias');
  } catch (erro) {
    console.log('Erro ao atualizar categoria', erro);
    res.redirect('/categorias');
  }
});

// Deletar categoria
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