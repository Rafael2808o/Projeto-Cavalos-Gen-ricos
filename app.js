import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

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


app.use(
    session({
        secret: "sesisenai",
        resave: false,
        saveUninitialized: false,
    })
);


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
app.use('/admin', adminRotas)
app.use('/categorias', categoriaRotas)
app.use('/produtos', produtoRotas)
app.use('/usuarios', usuarioRotas)


app.listen(3000, () =>
console.log('Servidor rodando em http://localhost:3000')
);
