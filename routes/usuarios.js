const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuarios");
const studentsController = require("../controllers/studentsController");
const jwt = require('jsonwebtoken');

router.get("/", (req, res) => {
    res.render("index");
});

router.post("/", (req, res) => {
    console.log(req.body);
    UsuarioController.IniciarSesion(req.body)
        .then((usuario) => {
            const token = jwt.sign({ role: usuario.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.redirect("/usuarios/Inicio");
        })
        .catch((err) => {
            res.render("error", { message: err.message, error: err });
        });
});

router.get("/Inicio", (req, res) => {
    if (!req.cookies || !req.cookies.token) {
        return res.redirect('/'); 
    }

    UsuarioController.Decodificar(req.cookies.token)
        .then((result) => {
            studentsController.Todos()
                .then((students) => {
                    res.render("Inicio", { token: result, students: students });
                })
                .catch((err) => {
                    res.render("error", { message: err.message, error: err });
                });
        })
        .catch((err) => {
            res.render("error", { message: err.message, error: err });
        });
});

router.get("/Registro", (req, res) => {
    res.render("Registro");
});

router.post("/Registro", (req, res) => {
    UsuarioController.Registrarse(req.body)
        .then(() => {
            res.redirect("/usuarios");
        })
        .catch((err) => {
            console.error(err);
            res.render("error", { message: err.message, error: err });
        });
});

router.get("/cerrar", (req, res) => {
    UsuarioController.CerrarSesion(req.cookies.token)
        .then(() => {
            res.clearCookie("token");
            res.redirect("/usuarios");
        })
        .catch((err) => {
            res.render("error", { message: err.message, error: err });
        });
});

router.get("/editar", (req, res) => {
    if (!req.cookies || !req.cookies.token) {
        return res.redirect('/'); 
    }

    UsuarioController.Decodificar(req.cookies.token)
        .then((result) => {
            res.render("editarUsuario", { usuario: result });
        })
        .catch((err) => {
            res.render("error", { message: err.message, error: err });
        });
});

router.put("/editar/:id", (req, res) => {
    UsuarioController.Editar(req.params.id, req.body)
        .then(() => {
            res.redirect("/usuarios");
        })
        .catch((err) => {
            res.render("error", { message: err.message, error: err });
        });
});

router.delete("/borrar/:id", (req, res) => {
    UsuarioController.BorrarUsuario(req.params.id)
        .then(() => {
            res.redirect("/usuarios/lista");
        })
        .catch((err) => {
            res.render("error", { message: err.message, error: err });
        });
});

module.exports = router;
