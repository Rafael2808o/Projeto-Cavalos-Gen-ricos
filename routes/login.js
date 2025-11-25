import express from 'express';
import BD from '../db.js';
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('admin/login');
});

router.post('/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        const buscaDados = await BD.query(
            'SELECT * FROM usuarios WHERE email = $1 AND senha = $2 AND ativo = true',
            [usuario, senha]
        );
       
        if(buscaDados.rows.length > 0){
            const user = buscaDados.rows[0];

            if (!user.ativo) {
                return res.render("admin/login", {
                    mensagem: `Usuário inativo.
                    Contate o administrador`,
                });
            }
           
            req.session.usuarioLogado = user.email;
            req.session.nomeUsuario = user.nome;
            req.session.idUsuario = user.id_usuario;
            req.session.administrador = user.administrador;
            req.session.autenticado = true;

            return res.redirect("/admin/")
        } else {
            res.render("admin/login", {
                mensagem: "Usuario ou senha incorretos.",
            });
        }
    } catch (erro) {
        console.log(erro);
        res.render("admin/login", {
            mensagem: "Erro ao processar login.",
        })
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

export default router