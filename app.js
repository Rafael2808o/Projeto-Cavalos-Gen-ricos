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


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

const app = express();
const PgSession = pgSession(session)

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())


// app.use(
//     session({
//         secret: "sesisenai",
//         resave: false,
//         saveUninitialized: false,
//     })
// );

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
     secure: true,
     sameSite: 'none',
  },
}));




app.get('/', (req, res) => res.render('landing/index'))


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
