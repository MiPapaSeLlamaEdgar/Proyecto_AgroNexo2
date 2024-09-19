const bcrypt = require('bcrypt');

// Insert Admin User
async function insertAdminUser(db) {
    let connection;
    try {
        connection = await db.getConnection();
        const [existingUser] = await connection.query('SELECT * FROM Users WHERE email = ?', ['holaeric12@gmail.com']);
        if (existingUser.length > 0) {
            console.log('El usuario administrador ya existe.');
            return; 
        }

        const plainPassword = 'Mnbvcx0987*';
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        await connection.beginTransaction();
        
        // Corrected SQL query syntax
        const query = `
            INSERT INTO Users (email, name, password, role_id)
            VALUES (?, ?, ?, 1)
        `;
        const values = ['holaeric12@gmail.com', 'Eric', hashedPassword];
        await connection.execute(query, values);

        const roleQuery = `
            INSERT INTO UserRoles (user_email, role_id)
            VALUES (?, 1)
        `;
        await connection.execute(roleQuery, ['holaeric12@gmail.com']);

        await connection.commit();
        console.log('Usuario administrador insertado correctamente.');
    } catch (error) {
        if (connection) await connection.rollback(); 
        console.error('Error al insertar el usuario administrador:', error);
    } finally {
        if (connection) await connection.release(); 
    }
}

// Function to display the login page
function login(req, res) {
    if (req.session.loggedin) {
        switch (req.session.user.role) {
            case 'Administrador':
                return res.redirect('/admin-dashboard');
            case 'Analista de Datos':
                return res.redirect('/analista-dashboard');
            default:
                return res.redirect('/user-dashboard');
        }
    } else {
        res.render('login/login'); 
    }
}

async function auth(req, res) {
    const data = req.body;

    let connection;
    try {
        connection = await req.db.getConnection();

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
                                    return res.json({ success: true, redirectUrl: '/admin-dashboard' });
                                case 'Analista de Datos':
                                    return res.json({ success: true, redirectUrl: '/analista-dashboard' });
                                default:
                                    return res.json({ success: true, redirectUrl: '/user-dashboard' });
                            }
                        });
                    });
                } else {
                    console.error('El usuario no tiene un rol asignado.');
                    return res.status(400).json({ success: false, message: 'El usuario no tiene un rol asignado.' });
                }
            } else {
                console.error('Contraseña incorrecta.');
                return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
            }
        } else {
            console.error('El usuario no existe con ese email.');
            return res.status(404).json({ success: false, message: 'El usuario no existe con ese email.' });
        }
    } catch (err) {
        console.error('Error consultando la base de datos:', err);
        return res.status(500).json({ success: false, message: 'Error consultando la base de datos.' });
    } finally {
        if (connection) await connection.release(); // Liberar la conexión
    }
}


// Function to display the registration page
function register(req, res) {
    res.render('login/register'); 
}

// Handle new user registration
async function storeUser(req, res) {
    const { email, name, password } = req.body; 
    const userRole = 'Usuarios'; 

    let connection;
    try {
        connection = await req.db.getConnection();
        await connection.beginTransaction();

        const [userdata] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (userdata.length > 0) {
            console.log('User already created');
            await connection.rollback();
            return res.render('login/register', { error: 'User already registered with this email.' });
        } else {
            const hash = await bcrypt.hash(password, 12);
            const userData = { email, name, password: hash };

            const [roleResult] = await connection.query('SELECT id FROM Roles WHERE name = ?', [userRole]);
            if (roleResult.length === 0) {
                console.error('Role not found in the database.');
                await connection.rollback();
                return res.render('login/register', { error: 'The default role does not exist in the database.' });
            }

            const roleId = roleResult[0].id;

            await connection.query('INSERT INTO Users SET ?', [userData]);
            await connection.query(
                'INSERT INTO UserRoles (user_email, role_id) VALUES (?, ?)',
                [email, roleId]
            );

            await connection.commit();
            res.redirect('/login');
        }
    } catch (err) {
        if (connection) await connection.rollback(); 
        console.error('Error during registration process:', err);
        return res.render('login/register', { error: 'Error registering user.' });
    } finally {
        if (connection) connection.release(); 
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
            res.clearCookie('session_cookie_name'); 
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

// Function to display default dashboard
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
    userDashboard,
    insertAdminUser
};