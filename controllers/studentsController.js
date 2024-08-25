const studentsModel = require('../models/studentsModel');
const usuarioController = require('./usuarios'); // Asegúrate de que la ruta sea correcta

class studentsController {

    async Todos(req, res) {
        try {
            console.log('Cookies:', req.cookies); // Verifica qué cookies están presentes
            console.log('Token:', req.cookies ? req.cookies.token : 'No hay token'); // Verifica si el token está presente
    
            if (!req || !req.cookies) {
                throw new Error('Request o cookies no definidos.');
            }
    
            if (!req.cookies.token) {
                throw new Error('Token de autenticación no disponible.');
            }
    
            const students = await studentsModel.Todos();
            const decoded = await usuarioController.Decodificar(req.cookies.token);
            const role = decoded.role;
    
            res.render('students', { students, role });
        } catch (error) {
            console.error("Error en Todos:", error.message);
            res.status(500).render('error', { error: "Error al obtener estudiantes: " + error.message });
        }
    }
    

    async Uno(req, res) {
        const id = parseInt(req.params.id, 10);
        try {
            const student = await studentsModel.Uno(id);

            // Verificar si el token está presente
            if (!req.cookies || !req.cookies.token) {
                throw new Error('Token de autenticación no disponible.');
            }

            // Decodificar el token para obtener el rol del usuario
            const decoded = await usuarioController.Decodificar(req.cookies.token);
            const role = decoded.role;

            // Renderizar la vista 'student' con los datos del estudiante y el rol del usuario
            res.render('student', { student, role });
        } catch (error) {
            console.error("Error en Uno:", error.message);
            res.status(404).render('error', { error: "Error al obtener estudiante: " + error.message });
        }
    }

    async Crear(req, res) {
        try {
            const datos = req.body;
            const newStudent = await studentsModel.Crear(datos);
            res.redirect('/students');
        } catch (error) {
            console.error("Error en Crear:", error.message);
            res.status(500).render('error', { error: "Error al crear estudiante: " + error.message });
        }
    }

    async Editar(req, res) {
        const id = req.params.id;
        const datos = req.body;
        try {
            const updatedStudent = await studentsModel.Editar(id, datos);
            res.redirect('/students');
        } catch (error) {
            console.error("Error en Editar:", error.message);
            res.status(500).render('error', { error: "Error al editar estudiante: " + error.message });
        }
    }

    async Eliminar(req, res) {
        const id = req.params.id;
        try {
            await studentsModel.Eliminar(id);
            res.redirect('/students');
        } catch (error) {
            console.error("Error en Eliminar:", error.message);
            res.status(500).render('error', { error: "Error al eliminar estudiante: " + error.message });
        }
    }

    async Contar(req, res) {
        try {
            const total = await studentsModel.Contar();

            // Verificar si el token está presente
            if (!req.cookies || !req.cookies.token) {
                throw new Error('Token de autenticación no disponible.');
            }

            // Decodificar el token para obtener el rol del usuario
            const decoded = await usuarioController.Decodificar(req.cookies.token);
            const role = decoded.role;

            // Renderizar la vista 'count' con el total de estudiantes y el rol del usuario
            res.render('count', { total, role });
        } catch (error) {
            console.error("Error en Contar:", error.message);
            res.status(500).render('error', { error: "Error al contar estudiantes" });
        }
    }

    async BuscarNombre(req, res) {
        const nombre = req.params.nombre;
        try {
            const students = await studentsModel.MostrarNombre(nombre);

            // Verificar si el token está presente
            if (!req.cookies || !req.cookies.token) {
                throw new Error('Token de autenticación no disponible.');
            }

            // Decodificar el token para obtener el rol del usuario
            const decoded = await usuarioController.Decodificar(req.cookies.token);
            const role = decoded.role;

            // Renderizar la vista 'search' con los estudiantes encontrados y el rol del usuario
            res.render('search', { students, role });
        } catch (error) {
            console.error("Error en BuscarNombre:", error.message);
            res.status(500).render('error', { error: "Error al buscar estudiante por nombre: " + error.message });
        }
    }

    async MostrarCarrera(req, res) {
        const carrera = req.params.carrera;
        try {
            const students = await studentsModel.MostrarCarrera(carrera);

            // Verificar si el token está presente
            if (!req.cookies || !req.cookies.token) {
                throw new Error('Token de autenticación no disponible.');
            }

            // Decodificar el token para obtener el rol del usuario
            const decoded = await usuarioController.Decodificar(req.cookies.token);
            const role = decoded.role;

            // Renderizar la vista 'carrera' con los estudiantes encontrados y el rol del usuario
            res.render('carrera', { students, role });
        } catch (error) {
            console.error("Error en MostrarCarrera:", error.message);
            res.status(500).render('error', { error: "Error al buscar estudiante por carrera: " + error.message });
        }
    }
}

module.exports = new studentsController();
