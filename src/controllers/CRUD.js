// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT Users.email, Users.name, Roles.name as role 
            FROM Users 
            LEFT JOIN Roles ON Users.role_id = Roles.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener todas las ideas
exports.getAllIdeas = async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT id, nombre, alcance, fecha_creacion, fecha_evaluacion, usuario_email, estado, conclusiones 
            FROM Ideas
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ideas:', error);
        res.status(500).json({ message: 'Error al obtener ideas' });
    }
};

// Obtener todas las evaluaciones
exports.getAllEvaluaciones = async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT id, idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje, creadoEn 
            FROM Evaluaciones
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener evaluaciones:', error);
        res.status(500).json({ message: 'Error al obtener evaluaciones' });
    }
};

// Obtener todos los roles con los usuarios asignados
exports.getAllRoles = async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT Users.email AS user_email, Roles.id AS role_id, Roles.name 
            FROM UserRoles 
            JOIN Users ON UserRoles.user_email = Users.email 
            JOIN Roles ON UserRoles.role_id = Roles.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error al obtener roles' });
    }
};

// Obtener análisis (ajustar según la lógica de negocio)
exports.getAnalisis = async (req, res) => {
    try {
        // Aquí puedes implementar cualquier lógica de análisis
        res.json({ message: 'Análisis generado correctamente.' });
    } catch (error) {
        console.error('Error al generar análisis:', error);
        res.status(500).json({ message: 'Error al generar análisis' });
    }
};

// Crear una nueva idea
exports.createIdea = async (req, res) => {
    try {
        const { nombre, alcance, usuario_email, estado, conclusiones } = req.body;

        // Validar datos
        if (!nombre || !usuario_email) {
            return res.status(400).json({ message: 'Nombre y usuario_email son requeridos' });
        }

        const [result] = await req.db.query(`
            INSERT INTO Ideas (nombre, alcance, usuario_email, estado, conclusiones) 
            VALUES (?, ?, ?, ?, ?)`, 
            [nombre, alcance, usuario_email, estado, conclusiones]
        );

        res.status(201).json({ id: result.insertId, nombre, alcance, usuario_email, estado, conclusiones });
    } catch (error) {
        console.error('Error al crear idea:', error);
        res.status(500).json({ message: 'Error al crear idea' });
    }
};

// Crear una nueva evaluación
exports.createEvaluacion = async (req, res) => {
    try {
        const { idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje } = req.body;

        // Validar datos
        if (!idea_id || !componentes) {
            return res.status(400).json({ message: 'Idea ID y componentes son requeridos' });
        }

        const [result] = await req.db.query(`
            INSERT INTO Evaluaciones (idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje]
        );

        res.status(201).json({ id: result.insertId, idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje });
    } catch (error) {
        console.error('Error al crear evaluación:', error);
        res.status(500).json({ message: 'Error al crear evaluación' });
    }
};

// Actualizar una idea
exports.updateIdea = async (req, res) => {
    try {
        const ideaId = req.params.id; // Obtén el ID de la idea desde los parámetros
        const { nombre, alcance, usuario_email, estado, conclusiones } = req.body;

        // Validar datos
        if (!nombre || !usuario_email) {
            return res.status(400).json({ message: 'Nombre y usuario_email son requeridos para la actualización' });
        }

        // Imprimir datos para depuración
        console.log('Actualizando idea con ID:', ideaId);
        console.log('Datos recibidos:', { nombre, alcance, usuario_email, estado, conclusiones });

        const [result] = await req.db.query(`
            UPDATE Ideas 
            SET nombre = ?, alcance = ?, usuario_email = ?, estado = ?, conclusiones = ? 
            WHERE id = ?`, 
            [nombre, alcance, usuario_email, estado, conclusiones, ideaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Idea no encontrada' });
        }

        res.status(200).json({ message: 'Idea actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar idea:', error);
        res.status(500).json({ message: 'Error al actualizar idea' });
    }
};



// Actualizar una evaluación
exports.updateEvaluacion = async (req, res) => {
    try {
        const evaluacionId = req.params.id;
        const { componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje } = req.body;

        // Validar datos
        if (!componentes) {
            return res.status(400).json({ message: 'Componentes son requeridos para la actualización' });
        }

        await req.db.query(`
            UPDATE Evaluaciones SET componentes = ?, etapas = ?, mercado = ?, aceptacion = ?, datos = ?, viabilidad_porcentaje = ? 
            WHERE id = ?`, 
            [componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje, evaluacionId]
        );

        res.status(200).json({ message: 'Evaluación actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar evaluación:', error);
        res.status(500).json({ message: 'Error al actualizar evaluación' });
    }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
    try {
        const userEmail = req.params.email;
        const { name, password, role_id } = req.body;

        // Validar datos
        if (!userEmail) {
            return res.status(400).json({ message: 'Email del usuario es requerido para la actualización' });
        }

        // Construir la consulta de actualización dinámicamente
        const fieldsToUpdate = [];
        const values = [];

        if (name) {
            fieldsToUpdate.push('name = ?');
            values.push(name);
        }
        if (password) {
            fieldsToUpdate.push('password = ?');
            values.push(password);
        }
        if (role_id) {
            fieldsToUpdate.push('role_id = ?');
            values.push(role_id);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: 'No hay campos para actualizar' });
        }

        const query = `UPDATE Users SET ${fieldsToUpdate.join(', ')} WHERE email = ?`;
        values.push(userEmail);

        await req.db.query(query, values);

        res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

// Actualizar un rol
exports.updateRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const { name } = req.body;

        // Validar datos
        if (!name) {
            return res.status(400).json({ message: 'El nombre del rol es requerido para la actualización' });
        }

        await req.db.query(`
            UPDATE Roles SET name = ? WHERE id = ?`, 
            [name, roleId]
        );

        res.status(200).json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({ message: 'Error al actualizar rol' });
    }
};

// Eliminar una idea
exports.deleteIdea = async (req, res) => {
    try {
        const ideaId = req.params.id;

        if (!ideaId) {
            return res.status(400).json({ message: 'ID de idea es requerido para la eliminación' });
        }

        await req.db.query('DELETE FROM Ideas WHERE id = ?', [ideaId]);
        res.status(200).json({ message: 'Idea eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar idea:', error);
        res.status(500).json({ message: 'Error al eliminar idea' });
    }
};

// Eliminar una evaluación
exports.deleteEvaluacion = async (req, res) => {
    try {
        const evaluacionId = req.params.id;

        if (!evaluacionId) {
            return res.status(400).json({ message: 'ID de evaluación es requerido para la eliminación' });
        }

        await req.db.query('DELETE FROM Evaluaciones WHERE id = ?', [evaluacionId]);
        res.status(200).json({ message: 'Evaluación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        res.status(500).json({ message: 'Error al eliminar evaluación' });
    }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    try {
        const userEmail = req.params.email;

        if (!userEmail) {
            return res.status(400).json({ message: 'Email del usuario es requerido para la eliminación' });
        }

        await req.db.query('DELETE FROM Users WHERE email = ?', [userEmail]);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

// Eliminar un rol
exports.deleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;

        if (!roleId) {
            return res.status(400).json({ message: 'ID del rol es requerido para la eliminación' });
        }

        await req.db.query('DELETE FROM Roles WHERE id = ?', [roleId]);
        res.status(200).json({ message: 'Rol eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        res.status(500).json({ message: 'Error al eliminar rol' });
    }
};
