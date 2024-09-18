function authorizeRoles(allowedRoles) {
    return (req, res, next) => {
        const user = req.session.user; // Verifica que el usuario esté almacenado en la sesión
  
        console.log('Verificando usuario en sesión:', user);
  
        // Verifica si el usuario está autenticado
        if (!user) {
            console.error('Acceso denegado: No estás autenticado.');
            return res.redirect('/login'); // Redirige a la página de inicio de sesión
        }
  
        // Asegúrate de que la propiedad 'role' esté definida en la sesión del usuario
        if (!user.role) {
            console.error('Error: El rol del usuario no está definido en la sesión.');
            console.log('Contenido de la sesión:', req.session); // Log para depuración
            return res.redirect('/login'); // Redirige a la página de inicio de sesión
        }
  
        // Normaliza la comparación de roles para evitar errores debido a mayúsculas o espacios adicionales
        const normalizedUserRole = user.role.trim().toLowerCase();
        const normalizedAllowedRoles = new Set(allowedRoles.map(role => role.trim().toLowerCase()));
  
        console.log('Rol del usuario:', normalizedUserRole);
        console.log('Roles permitidos:', Array.from(normalizedAllowedRoles));
  
        // Verifica si el rol del usuario está permitido
        if (!normalizedAllowedRoles.has(normalizedUserRole)) {
            console.warn(`Acceso denegado: Rol no autorizado. Rol del usuario: ${user.role}, Roles permitidos: ${Array.from(normalizedAllowedRoles).join(', ')}`);
            return res.status(403).json({ success: false, message: 'No tienes permiso para acceder a esta página.' });
        }
  
        // Si pasa todas las verificaciones, continúa con la siguiente función de middleware o ruta
        next();
    };
}

module.exports = authorizeRoles;
