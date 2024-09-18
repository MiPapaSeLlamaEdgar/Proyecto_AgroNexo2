const express = require('express');
const router = express.Router();
const crudController = require('../controllers/CRUD');

// Rutas para operaciones CRUD
router.get('/usuarios', crudController.getAllUsers);
router.get('/ideas', crudController.getAllIdeas);
router.get('/evaluaciones', crudController.getAllEvaluaciones);

// Nuevas rutas
router.get('/roles', crudController.getAllRoles);
router.get('/analisis', crudController.getAnalisis);

router.post('/ideas', crudController.createIdea);
router.post('/evaluaciones', crudController.createEvaluacion);

router.put('/ideas/:id', crudController.updateIdea);

router.delete('/ideas/:id', crudController.deleteIdea);

module.exports = router;
