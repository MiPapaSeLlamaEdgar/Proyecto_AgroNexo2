const express = require('express');
const { engine } = require('express-handlebars');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');                                                                                                                                                                                       
require('dotenv').config();

const loginRoutes = require('./routes/login.js');
const chatRoutes = require('./routes/chatRoutes.js');
const evaluacionRoutes = require('./routes/evaluacionRoutes.js');
const authorizeRoles = require('./middleware/authMiddleware');
const crudRoutes = require('./routes/crudRoutes.js');
const { insertAdminUser } = require('./controllers/LoginController');

const app = express();
app.set('port', process.env.PORT || 5000);

// Configuración del motor de plantillas Handlebars
app.engine('.html', engine({
    extname: '.html',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        }
    }
}));

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// Middleware para manejar sesiones y solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos para almacenar sesiones
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'GestionAgricola'
});

// Configuración de la sesión con express-session
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 día
        sameSite: 'lax',
    }
}));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Crear un pool de conexiones a la base de datos usando mysql2/promise
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'GestionAgricola',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware para establecer el pool de conexiones a la base de datos
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Ejecutar `insertAdminUser` al iniciar el servidor
async function init() {
    try {
        await insertAdminUser(pool); // Pasar el pool directamente como db
        console.log('Usuario administrador insertado al iniciar el servidor.');
    } catch (error) {
        console.error('Error al insertar el usuario administrador al iniciar:', error);
    }
}

// Rutas
app.use('/', loginRoutes);
app.use('/', chatRoutes);
app.use('/', evaluacionRoutes);
app.use('/api', crudRoutes);

// Ejemplo de cómo proteger una ruta con el middleware authorizeRoles
app.get('/analista-dashboard', authorizeRoles(['Analista de Datos']), (req, res) => {
    res.render('dashboard/analista-dashboard', { user: req.session.user });
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

// Manejar errores de servidor
app.use((err, req, res) => {
    console.error('Error del servidor:', err);
    res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor y ejecutar `init()`
app.listen(app.get('port'), async () => {
    console.log('Servidor corriendo en el puerto', app.get('port'));
    await init(); // Ejecutar la función init al iniciar el servidor
});
