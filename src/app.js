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

const app = express();
app.set('port', process.env.PORT || 5000);

// Configuración del motor de plantillas Handlebars con helpers personalizados
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

// Ejemplo de una función para almacenar datos en la base de datos
async function storeUser(req, res) {
    let connection;
    try {
        // Obtén una conexión del pool
        connection = await req.db.getConnection();
        
        // Inicia una transacción
        await connection.beginTransaction();
        
        // Ejemplo: tu lógica para almacenar el usuario en la base de datos
        const userData = {
            email: req.body.email,
            name: req.body.name,
            password: req.body.password
        };
        
        // Insertar usuario en la tabla Users
        await connection.query('INSERT INTO Users SET ?', userData);

        // Confirma la transacción
        await connection.commit();
        
        res.status(201).send('Usuario registrado correctamente');
    } catch (error) {
        console.error('Error durante el registro del usuario:', error);
        // Deshacer la transacción si ocurrió un error
        if (connection) await connection.rollback();
        res.status(500).send('Error al registrar el usuario');
    } finally {
        // Libera la conexión de vuelta al pool
        if (connection) connection.release();
    }
}

// Rutas
app.use('/', loginRoutes);
app.use('/', chatRoutes);
app.use('/', evaluacionRoutes);
app.use('/api', crudRoutes);

// Ejemplo de cómo proteger una ruta con el middleware authorizeRoles
app.get('/analista-dashboard', authorizeRoles(['analista de datos']), (req, res) => {
  res.render('dashboard/analista-dashboard', { user: req.session.user });
});

// Manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).send('Ruta no encontrada');
});

// Manejar errores de servidor
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log('Servidor corriendo en el puerto', app.get('port'));
});
