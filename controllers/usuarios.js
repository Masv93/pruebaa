const UsuarioModel = require('../models/usuarios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


class UsuarioController {
    static async IniciarSesion(req, res) {
        const { username, password } = req.body;

        try {
            // Obtener el usuario por username
            const user = await UsuarioModel.obtenerPorUsername(username);
            if (!user) {
                return res.render('login', { error_messages: ['Usuario no encontrado'] });
            }

            // Comparar la contraseña proporcionada con la almacenada
            const coincide = await bcrypt.compare(password, user.password);
            if (!coincide) {
                return res.render('login', { error_messages: ['Contraseña incorrecta'] });
            }

            // Generar el token JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    rol: user.rol,
                    username: user.username // Incluye otros datos si es necesario
                },
                process.env.JWT_SECRET, // Clave secreta
                {
                    expiresIn: '1h' // Tiempo de expiración del token
                }
            );

            // Enviar cookie con el token
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/estudiantes');
        } catch (error) {
            res.render('login', { error_messages: ['Error al iniciar sesión'] });
        }
    }

    Registrarse(usuario){
        return new Promise((resolve, reject) => {
            UsuarioModel.Registrarse(usuario)
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        })
    }

    async Decodificar(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            });
        });
    }


    CerrarSesion(cookie){
        return new Promise((resolve, reject) => {
            UsuarioModel.CerrarSesion(cookie)
            .then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            });
        })
    }

    Editar(id,datos){
        return new Promise((resolve, reject) => {
            UsuarioModel.Editar(id,datos)
            .then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            });
        })
    }

    Obtener(){
        return new Promise((resolve, reject) => {
            UsuarioModel.Obtener()
            .then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            });
        })
    }

    BorrarUsuario(id){
        return new Promise((resolve, reject) => {
            UsuarioModel.BorrarUsuario(id)
            .then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            });
        })
    }
}
module.exports = new UsuarioController();