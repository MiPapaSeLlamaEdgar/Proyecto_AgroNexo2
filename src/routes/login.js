const express = require('express');
const LoginController = require('../controllers/LoginController');
const authorizeRoles = require('../middleware/authMiddleware'); // Importa el middleware para autorización de roles

const router = express.Router();

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'No estás autenticado.' });
    }
}

// Ruta para mostrar la página de login
router.get('/login', LoginController.login);

// Ruta para mostrar la página de registro
router.get('/register', LoginController.register);

// Ruta para manejar la autenticación (POST de login)
router.post('/auth', LoginController.auth);

// Ruta para manejar el cierre de sesión
router.get('/logout', LoginController.logout);

// Ruta para manejar la autenticación (POST de Register)
router.post('/storeUser', LoginController.storeUser);

// Ruta para mostrar la página de Index
router.get('/index', LoginController.index);

// Ruta para mostrar la página de Reset Password
router.get('/reset-password', LoginController.resetPassword);

// Ruta para mostrar la página de Admin, accesible solo para administradores
router.get('/admin', isAuthenticated, authorizeRoles(['Administrador']), LoginController.admin);

// Rutas para los dashboards según el rol del usuario
router.get('/admin-dashboard', isAuthenticated, authorizeRoles(['Administrador']), LoginController.adminDashboard);
router.get('/analista-dashboard', isAuthenticated, authorizeRoles(['Analista de Datos']), LoginController.analistaDashboard);
router.get('/user-dashboard', isAuthenticated, authorizeRoles(['Usuarios']), LoginController.userDashboard);

module.exports = router;
