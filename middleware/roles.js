// middleware/roles.js

const verificarRol = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.rol)) {
            next();
        } else {
            res.redirect('/usuarios/acceso-denegado'); // Redirige a la vista de acceso denegado
        }
    };
};

module.exports = verificarRol;
