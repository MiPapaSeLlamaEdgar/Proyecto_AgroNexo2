const bcrypt = require('bcrypt');

// Function to display the login page
function login(req, res) {
    if (req.session.loggedin) {
        // Redirect based on user role
        switch (req.session.user.role) {
            case 'Administrador':
                return res.redirect('/admin-dashboard');
            case 'Analista de Datos':
                return res.redirect('/analista-dashboard');
            default:
                return res.redirect('/user-dashboard');
        }
    } else {
        res.render('login/login'); // Render login page
    }
}

// Handle user authentication using async/await
async function auth(req, res) {
    const data = req.body;

    try {
        const connection = await req.db.getConnection();

        // Consulta para obtener el usuario
        const [results] = await connection.query('SELECT * FROM Users WHERE email = ?', [data.email]);

        if (results.length > 0) {
            const user = results[0];

            // Verifica la contraseña
            const isMatch = await bcrypt.compare(data.password, user.password);
            
            if (isMatch) {
                // Obtén el rol del usuario
                const [roles] = await connection.query(
                    'SELECT r.name FROM Roles r INNER JOIN UserRoles ur ON r.id = ur.role_id WHERE ur.user_email = ?',
                    [user.email]
                );

                if (roles.length > 0) {
                    const userRole = roles[0].name.trim();
                    console.log('Rol obtenido del usuario:', userRole);

                    // Regenerar la sesión
                    req.session.regenerate((err) => {
                        if (err) {
                            console.error('Error regenerando la sesión:', err);
                            return res.status(500).json({ success: false, message: 'Error iniciando sesión.' });
                        }

                        // Configura el usuario en la sesión
                        req.session.loggedin = true; 
                        req.session.user = {
                            email: user.email,
                            name: user.name,
                            role: userRole
                        };

                        // Guarda la sesión y redirige
                        req.session.save((err) => {
                            if (err) {
                                console.error('Error guardando la sesión:', err);
                                return res.status(500).json({ success: false, message: 'Error iniciando sesión.' });
                            }

                            // Redirige basado en el rol del usuario
                            switch (userRole) {
                                case 'Administrador':
                                    return res.redirect('/admin-dashboard');
                                case 'Analista de Datos':
                                    return res.redirect('/analista-dashboard');
                                default:
                                    return res.redirect('/user-dashboard');
                            }
                        });
                    });
                } else {
                    console.error('El usuario no tiene un rol asignado.');
                    return res.render('login/login', { error: 'El usuario no tiene un rol asignado.' });
                }
            } else {
                console.error('Contraseña incorrecta.');
                return res.render('login/login', { error: 'Contraseña incorrecta.' });
            }
        } else {
            console.error('El usuario no existe con ese email.');
            return res.render('login/login', { error: 'El usuario no existe con ese email.' });
        }
    } catch (err) {
        console.error('Error consultando la base de datos:', err);
        return res.render('login/login', { error: 'Error consultando la base de datos.' });
    }
}

// Function to display the registration page
function register(req, res) {
    res.render('login/register'); // Render register page
}

// Handle new user registration using async/await
async function storeUser(req, res) {
    const { email, name, password, role } = req.body;
    const userRole = role || 'Usuarios'; // Set "Usuarios" as default if no role is selected

    let connection;
    try {
        // Obtén una conexión del pool
        connection = await req.db.getConnection();
        
        // Inicia una transacción
        await connection.beginTransaction();

        // Check if the user already exists
        const [userdata] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);

        if (userdata.length > 0) {
            console.log('User already created');
            await connection.rollback();
            return res.render('login/register', { error: 'User already registered with this email.' });
        } else {
            // Hash the password
            const hash = await bcrypt.hash(password, 12);
            const userData = { email, name, password: hash };

            // Check if role exists in 'Roles' table
            const [roleResult] = await connection.query('SELECT id FROM Roles WHERE name = ?', [userRole]);
            if (roleResult.length === 0) {
                console.error('Rol no encontrado en la base de datos.');
                await connection.rollback();
                return res.render('login/register', { error: 'El rol seleccionado no existe.' });
            }

            const roleId = roleResult[0].id;

            // Insert user into 'Users' table
            await connection.query('INSERT INTO Users SET ?', [userData]);

            // Insert user role into 'UserRoles' table
            await connection.query(
                'INSERT INTO UserRoles (user_email, role_id) VALUES (?, ?)',
                [email, roleId]
            );

            // Commit the transaction
            await connection.commit();

            // Redirect to login after successful registration
            res.redirect('/login');
        }
    } catch (err) {
        if (connection) await connection.rollback(); // Rollback transaction if there's an error
        console.error('Error during registration process:', err);
        return res.render('login/register', { error: 'Error registering user.' });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
}

// Function to display admin page
function admin(req, res) {
    res.render('login/admin', { user: req.session.user });
}

// Function to display index page
function index(req, res) {
    res.render('login/index');
}

// Function to display reset password page
function resetPassword(req, res) {
    res.render('login/reset-password');
}

// Handle user logout
function logout(req, res) {
    if (req.session.loggedin) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Error logging out.');
            }
            res.clearCookie('session_cookie_name'); // Ensure session cookie is cleared
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
}

// Function to display admin dashboard
function adminDashboard(req, res) {
    res.render('dashboard/admin-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

// Function to display analista dashboard
function analistaDashboard(req, res) {
    res.render('dashboard/analista-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

// Function to display default dashboard (for users without a specific role)
function userDashboard(req, res) {
    res.render('dashboard/user-dashboard', { 
        user: req.session.user, 
        role: req.session.user.role 
    });
}

module.exports = {
    login,
    auth,
    register,
    storeUser,
    logout,
    index,
    resetPassword,
    admin,
    adminDashboard,
    analistaDashboard,
    userDashboard
};
