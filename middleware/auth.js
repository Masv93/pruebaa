// middleware/auth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario'); // Asegúrate de que la ruta sea correcta

const verificarToken = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send('Token inválido');
            }

            // Verificar si el usuario aún existe en la base de datos
            Usuario.obtenerPorId(decoded.id)
                .then(usuario => {
                    if (!usuario) {
                        res.clearCookie('token'); // Limpiar la cookie del token
                        return res.redirect('/usuarios/login'); // Usuario no existe, redirigir al login
                    }
                    req.user = usuario; // Pasar el usuario a la siguiente función
                    next();
                })
                .catch(err => {
                    console.error('Error al verificar usuario:', err);
                    res.status(500).send('Error interno del servidor');
                });
        });
    } else {
        res.redirect('/usuarios/login');
    }
};

module.exports = verificarToken;
