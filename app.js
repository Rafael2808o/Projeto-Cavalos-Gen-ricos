import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

import loginRotas from './routes/login.js'
import adminRotas from './routes/admin.js';
import categoriaRotas from './routes/categorias.js'
import produtoRotas from './routes/produtos.js'
import usuarioRotas from './routes/usuarios.js'
import pgSession from 'connect-pg-simple';

import movimentacaoRotas from './routes/movimentacao.js';

import BD from './db.js'; // Conexão com o banco

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

const app = express();
const PgSession = pgSession(session)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  store: new PgSession({
    conString: "postgres://postgres.kdcjgumytrmricqjmqwm:m9N7JAQR3w4KVUnw@aws-1-sa-east-1.pooler.supabase.com:6543/postgres",
    tableName: 'session',
  }),
  secret: "sesisenai",
  resave: false,
  saveUninitialized: false,
  cookie: {
     maxAge: 1000 * 60 * 60 * 24, // 1 day
     secure: false,      
     sameSite: 'lax',     
  },
}));

app.get('/', async (req, res) => {
  try {
    const resultado = await BD.query(`
      SELECT 
        p.id_produto,
        p.nome,
        p.valor_custo,
        COALESCE(p.descricao, '-') AS descricao,
        COALESCE(p.imagem, 'https://via.placeholder.com/300') AS imagem,
        COALESCE(SUM(CASE WHEN m.tipo ILIKE 'Saída' THEN m.quantidade ELSE 0 END), 0) AS total_saida
      FROM produtos p
      LEFT JOIN movimentacao_estoque m ON p.id_produto = m.id_produto
      GROUP BY p.id_produto, p.nome, p.valor_custo, p.descricao, p.imagem
      ORDER BY total_saida DESC
      LIMIT 1
    `);

    const produtoMaisVendido = resultado.rows[0] || null;

const resultadoMaisNovo = await BD.query(`
      SELECT 
        id_produto,
        nome,
        valor_custo,
        COALESCE(descricao, '-') AS descricao,
        COALESCE(imagem, 'https://via.placeholder.com/300') AS imagem,
        data_cadastro
      FROM produtos
      ORDER BY data_cadastro DESC
      LIMIT 1
    `);
    const produtoMaisNovo = resultadoMaisNovo.rows[0] || null;

    const resultadoMaisBarato = await BD.query(`
  SELECT 
    id_produto,
    nome,
    valor_custo,
    COALESCE(descricao, '-') AS descricao,
    COALESCE(imagem, 'https://via.placeholder.com/300') AS imagem
  FROM produtos
  ORDER BY valor_custo ASC
  LIMIT 1
`);

const produtoMaisBarato = resultadoMaisBarato.rows[0] || null;
    res.render('landing/index', { produtoMaisVendido, produtoMaisNovo, produtoMaisBarato });

  } catch (erro) {
    console.error('Erro ao buscar produtos:', erro);
    res.render('landing/index', { produtoMaisVendido: null, produtoMaisNovo: null, produtoMaisBarato: null });
  }
});






const verificarAutenticacao = (req, res, next) =>{
    if(req.session.usuarioLogado) {
        res.locals.usuariosLogado = req.session.usuarioLogado;
        res.locals.nomeUsuario = req.session.nomeUsuario;
        res.locals.idUsuario = req.session.idUsuario;
        res.locals.administrador = req.session.administrador;
        next()
    } else{
        res.redirect("/admin/login")
    }
}

app.use('/admin', loginRotas) 
app.use('/admin',verificarAutenticacao, adminRotas)
app.use('/categorias', verificarAutenticacao, categoriaRotas)
app.use('/produtos', verificarAutenticacao, produtoRotas)
app.use('/usuarios', verificarAutenticacao, usuarioRotas)
app.use('/movimentacao', verificarAutenticacao, movimentacaoRotas);

app.listen(3000, () =>
console.log('Servidor rodando em http://localhost:3000')
);
