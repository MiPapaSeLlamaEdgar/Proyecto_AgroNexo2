    const express = require('express');
    const router = express.Router();
    const crudController = require('../controllers/CRUD'); // Asegúrate de que esta ruta es correcta

    // Rutas para obtener datos
    router.get('/usuarios', crudController.getAllUsers);
    router.get('/ideas', crudController.getAllIdeas);
    router.get('/evaluaciones', crudController.getAllEvaluaciones);
    router.get('/roles', crudController.getAllRoles);
    router.get('/analisis', crudController.getAnalisis);

    // Rutas para crear nuevos registros
    router.post('/ideas', crudController.createIdea);
    router.post('/evaluaciones', crudController.createEvaluacion);

    // Rutas para actualizar registros
    router.put('/ideas/:id', crudController.updateIdea);
    router.put('/usuarios/:email', crudController.updateUser);
    router.put('/roles/:id', crudController.updateRole);
    router.put('/evaluaciones/:id', crudController.updateEvaluacion); // Ruta para actualizar una evaluación

    // Rutas para eliminar registros
    router.delete('/ideas/:id', crudController.deleteIdea);
    router.delete('/usuarios/:email', crudController.deleteUser);
    router.delete('/roles/:id', crudController.deleteRole);
    router.delete('/evaluaciones/:id', crudController.deleteEvaluacion); // Ruta para eliminar una evaluación

    module.exports = router;
