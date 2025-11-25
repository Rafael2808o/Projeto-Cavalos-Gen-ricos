import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session'; // Adicionei o import do 'express-session' que faltava

import loginRotas from './routes/login.js'
import adminRotas from './routes/admin.js';
import categoriaRotas from './routes/categorias.js'
import produtoRotas from './routes/produtos.js'
import usuarioRotas from './routes/usuarios.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Configuração da Sessão
app.use(
    session({
        secret: "sesisenai",
        resave: false,
        saveUninitialized: false,
    })
);

// Rota da página inicial (landing page)
app.get('/', (req, res) => res.render('landing/index'))


// Middleeware de autenticação
const verificarAutenticacao = (req, res, next) =>{
    if(req.session.usuarioLogado) {
        res.locals.usuariosLogado = req.session.usuarioLogado;

        res.locals.nomeUsuario = req.session.nomeUsuario;

        res.locals.idUsuario = req.session.idUsuario;

        // Corrigido: O seu código original tinha "adiministrador", mudei para "administrador"
        res.locals.administrador = req.session.administrador;

        next()
    } else{
        // O redirecionamento agora é para /admin/login para ser consistente
        res.redirect("/admin/login")
    }
}


// A CORREÇÃO ESTÁ AQUI: MONTANDO loginRotas EM '/admin'
app.use('/admin', loginRotas) // Agora acessível via /admin/login
app.use('/admin', adminRotas)
app.use('/categorias', categoriaRotas)
app.use('/produtos', produtoRotas)
app.use('/usuarios', usuarioRotas)

// Inicia o servidor na porta 3000
app.listen(3000, () =>
console.log('Servidor rodando em http://localhost:3000')
);
