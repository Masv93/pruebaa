const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');
const usuarioController = require('../controllers/usuarios');

// Middleware para verificar roles
function verificarRol(permittedRoles) {
    return async (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(403).render('error', { error: 'Acceso denegado: no se proporcionó token.' });
            }

            const decoded = await usuarioController.Decodificar(token);
            const { rol } = decoded; // Asumiendo que el rol viene en el token

            if (!permittedRoles.includes(rol)) {
                return res.status(403).render('error', { error: 'Acceso denegado: No tienes permisos suficientes.' });
            }

            next();
        } catch (error) {
            res.status(500).render('error', { error: 'Error de autenticación.' });
        }
    };
}

// Rutas accesibles por cualquier rol
router.get('/count', async (req, res) => {
    try {
        await studentsController.Contar(req, res);
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.get('/carrera/:carrera', async (req, res) => {
    try {
        const carrera = req.params.carrera;
        const students = await studentsController.MostrarCarrera(carrera);
        res.render('carrera', { students, carrera });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.get('/search/:nombre', async (req, res) => {
    try {
        const nombre = req.params.nombre;
        if (!nombre) {
            console.log('buscar nombre');
            throw new Error("Debe proporcionar un nombre válido.");
        }
        const students = await studentsController.BuscarNombre(nombre);
        res.render('search', { students });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const students = await studentsController.Todos();
        res.render('students', { students });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const student = await studentsController.Uno(id);
        res.render('student', { student });
    } catch (error) {
        res.status(404).render('error', { error: error.message });
    }
});

// Rutas protegidas, solo accesibles por el rol "admin"
router.post('/', verificarRol(['admin']), async (req, res) => {
    try {
        const newStudent = req.body;
        await studentsController.Crear(newStudent);
        res.redirect('/students');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.put('/:id', verificarRol(['admin']), async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const estudianteData = req.body;
    try {
        await studentsController.Editar(id, estudianteData);
        res.redirect('/students');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.delete('/:id', verificarRol(['admin']), async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        await studentsController.Eliminar(id);
        res.redirect('/students');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router;
