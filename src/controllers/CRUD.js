// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        // Asegúrate de que seleccionas los campos que existen en la tabla
        const [rows] = await req.db.query('SELECT email, name FROM Users');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener todas las ideas
exports.getAllIdeas = async (req, res) => {
    try {
        // Selecciona solo las columnas que necesitas y asegúrate de que existen
        const [rows] = await req.db.query('SELECT id, nombre, alcance, fecha_creacion, fecha_evaluacion, usuario_email, estado, conclusiones FROM Ideas');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ideas:', error);
        res.status(500).json({ message: 'Error al obtener ideas' });
    }
};

// Obtener todas las evaluaciones
exports.getAllEvaluaciones = async (req, res) => {
    try {
        // Selecciona solo las columnas que necesitas y asegúrate de que existen
        const [rows] = await req.db.query('SELECT id, idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje, creadoEn FROM Evaluaciones');
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
            SELECT Users.email AS user_email, Roles.name 
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


// Generar análisis (o devolver información de análisis)
exports.getAnalisis = async (req, res) => {
    try {
        // Aquí podrías añadir lógica para generar o devolver análisis
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

        const ideaData = { nombre, alcance, usuario_email, estado, conclusiones };

        // Especifica las columnas en las que quieres insertar los datos
        const [result] = await req.db.query('INSERT INTO Ideas (nombre, alcance, usuario_email, estado, conclusiones) VALUES (?, ?, ?, ?, ?)', 
        [nombre, alcance, usuario_email, estado, conclusiones]);

        res.status(201).json({ id: result.insertId, ...ideaData });
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

        const evaluacionData = { idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje };

        // Especifica las columnas en las que quieres insertar los datos
        const [result] = await req.db.query('INSERT INTO Evaluaciones (idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje]);

        res.status(201).json({ id: result.insertId, ...evaluacionData });
    } catch (error) {
        console.error('Error al crear evaluación:', error);
        res.status(500).json({ message: 'Error al crear evaluación' });
    }
};

// Actualizar una idea
exports.updateIdea = async (req, res) => {
    try {
        const ideaId = req.params.id;
        const { nombre, alcance, usuario_email, estado, conclusiones } = req.body;

        // Validar datos
        if (!nombre || !usuario_email) {
            return res.status(400).json({ message: 'Nombre y usuario_email son requeridos para la actualización' });
        }

        const ideaData = { nombre, alcance, usuario_email, estado, conclusiones };

        // Especifica las columnas en las que quieres actualizar los datos
        await req.db.query('UPDATE Ideas SET nombre = ?, alcance = ?, usuario_email = ?, estado = ?, conclusiones = ? WHERE id = ?', 
        [nombre, alcance, usuario_email, estado, conclusiones, ideaId]);

        res.status(200).json({ message: 'Idea actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar idea:', error);
        res.status(500).json({ message: 'Error al actualizar idea' });
    }
};

// Eliminar una idea
exports.deleteIdea = async (req, res) => {
    try {
        const ideaId = req.params.id;

        // Validar que el ID de la idea sea válido
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
