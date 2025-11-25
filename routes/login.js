import express from 'express';
import BD from '../db.js';
const router = express.Router();

// Exibe tela de Login (GET /admin/login)
router.get('/login', (req, res) => {
    res.render('admin/login');
});

// Processa o Login (POST /admin/login)
router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        // CORREÇÃO AQUI: Tabela alterada de 'usuario' para 'usuarios'
        const buscaDados = await BD.query(
            'SELECT * FROM usuarios WHERE email = $1 AND senha = $2 AND ativo = true',
            [usuario, senha]
        );
       
        if(buscaDados.rows.length > 0){
            const user = buscaDados.rows[0];

            // verifica se o usuario esta ativo
            if (!user.ativo) {
                return res.render("admin/login", {
                    mensagem: `Usuário inativo.
                    Contate o administrador`,
                });
            }
           
            // grava dados na sessão
            req.session.usuarioLogado = user.email;
            req.session.nomeUsuario = user.nome;
            req.session.idUsuario = user.id_usuario;
            req.session.administrador = user.administrador;
            req.session.autenticado = true;

            return res.redirect("/admin/")
        } else {
            // nenhum usuario encontrado
            res.render("admin/login", {
                mensagem: "Usuario ou senha incorretos.",
            });
        }
    } catch (erro) {
        // MUITO IMPORTANTE: Verifique o console.log no seu terminal
        console.log(erro);
        res.render("admin/login", {
            mensagem: "Erro ao processar login.",
        })
    }
});

// Logout (GET /admin/logout)
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

export default router