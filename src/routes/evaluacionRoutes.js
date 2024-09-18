const express = require('express');
const router = express.Router();
const authorizeRoles = require('../middleware/authMiddleware.js');
const openaiService = require('../../openaiService');

// Ruta GET para renderizar la página de evaluación simplificada
router.get('/dashboard/functions/evaluacion2', authorizeRoles(['Analista de Datos']), (req, res) => {
    res.render('dashboard/functions/evaluacion2', {
        layout: 'main',
        user: req.session.user,
        role: req.session.role
    });
});

// Ruta para obtener los componentes
router.post('/dashboard/functions/evaluacion2/componentes', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription } = req.body;

    try {
        // Genera los componentes
        const componentMessage = `
        Basado en un contexto colombiano y en la siguiente descripción del producto "${productName}":
        
        Descripción del Producto: ${productDescription}

        Asumiendo el rol de diseñador de prototipos, ¿podrías generar una lista de los elementos de componentes necesarios que podrían ser hardware, software o elementos de materia prima para la implementación de esta idea en el mercado agrícola?
        `;
        const componentResponse = await openaiService.getChatGPTResponse(componentMessage);

        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: componentResponse.trim() });
    } catch (error) {
        console.error('Error al procesar los componentes:', error);
        res.status(500).json({ error: 'Error al evaluar los componentes del producto' });
    }
});

// Ruta para obtener las etapas
router.post('/dashboard/functions/evaluacion2/etapas', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription, componentResponse } = req.body;

    try {
        const stagesMessage = `
        Basado en un contexto colombiano y en la descripción del producto y la respuesta anterior de "${productName}":
        
        Descripción del Producto: ${productDescription}
        Componentes del Prototipo: ${componentResponse}

        Como diseñador de prototipos, desglosa las etapas metodológicas necesarias para desarrollar e implementar este prototipo.
        `;
        const stagesResponse = await openaiService.getChatGPTResponse(stagesMessage);

        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: stagesResponse.trim() });
    } catch (error) {
        console.error('Error al procesar las etapas:', error);
        res.status(500).json({ error: 'Error al evaluar las etapas del producto' });
    }
});

// Ruta para obtener la implementación en el mercado
router.post('/dashboard/functions/evaluacion2/mercado', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription, componentResponse, stagesResponse } = req.body;

    try {
        const marketMessage = `
        Basado en un contexto colombiano y en la descripción del producto y las respuestas anteriores para "${productName}":
        
        Descripción del Producto: ${productDescription}
        Componentes del Prototipo: ${componentResponse}
        Etapas para desarrollar e implementar el prototipo: ${stagesResponse}

        Como analista de mercado, detalla las etapas necesarias para implementar esta idea en el mercado agrícola.
        `;
        const marketResponse = await openaiService.getChatGPTResponse(marketMessage);
        
        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: marketResponse.trim() });
    } catch (error) {
        console.error('Error al procesar la implementación en el mercado:', error);
        res.status(500).json({ error: 'Error al evaluar la implementación en el mercado del producto' });
    }
});

// Ruta para evaluar la aceptación del mercado
router.post('/dashboard/functions/evaluacion2/aceptacion', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription, componentResponse, stagesResponse, marketResponse } = req.body;

    try {
        const acceptanceMessage = `
        Basado en un contexto colombiano y en la descripción del producto y las respuestas anteriores para "${productName}":
        
        Descripción del Producto: ${productDescription}
        Componentes del Prototipo: ${componentResponse}
        Etapas para desarrollar e implementar el prototipo: ${stagesResponse}
        Implementación en el mercado: ${marketResponse}

        ¿Cuál es la viabilidad general en términos de oferta y demanda en el mercado agrícola?
        `;
        const acceptanceResponse = await openaiService.getChatGPTResponse(acceptanceMessage);
        
        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: acceptanceResponse.trim() });
    } catch (error) {
        console.error('Error al evaluar la aceptación del mercado:', error);
        res.status(500).json({ error: 'Error al evaluar la aceptación del mercado del producto' });
    }
});

// Ruta para calcular los costos, tiempo y cantidad de personas
router.post('/dashboard/functions/evaluacion2/costos', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription, componentResponse, stagesResponse, marketResponse, acceptanceResponse } = req.body;

    try {
        const datesMessage = `
        Basado en un contexto colombiano y en la descripción del producto y las respuestas anteriores para "${productName}":
        
        Descripción del Producto: ${productDescription}
        Componentes del Prototipo: ${componentResponse}
        Etapas para desarrollar e implementar el prototipo: ${stagesResponse}
        Implementación en el mercado: ${marketResponse}
        Aceptación del mercado: ${acceptanceResponse}

        Proporciona:
        - Costo promedio.
        - Tiempo promedio.
        - Cantidad de personas necesarias.
        `;
        const datesResponse = await openaiService.getChatGPTResponse(datesMessage);
        
        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: datesResponse.trim() });
    } catch (error) {
        console.error('Error al calcular los costos, tiempo y cantidad de personas:', error);
        res.status(500).json({ error: 'Error al calcular los costos, tiempo y cantidad de personas del producto' });
    }
});

// Ruta para calcular la viabilidad en porcentaje
router.post('/dashboard/functions/evaluacion2/viabilidad', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription, componentResponse, stagesResponse, marketResponse, acceptanceResponse, datesResponse } = req.body;

    try {
        const percentageMessage = `
        Basado en un contexto colombiano y en la descripción del producto y las respuestas anteriores para "${productName}":
        
        Descripción del Producto: ${productDescription}
        Componentes del Prototipo: ${componentResponse}
        Etapas para desarrollar e implementar el prototipo: ${stagesResponse}
        Implementación en el mercado: ${marketResponse}
        Aceptación del mercado: ${acceptanceResponse}
        Costos, Tiempo, Cantidad de personas: ${datesResponse}

        Calcula la viabilidad general como un porcentaje.
        `;
        const percentageResponse = await openaiService.getChatGPTResponse(percentageMessage);
        
        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: percentageResponse.trim() });
    } catch (error) {
        console.error('Error al calcular la viabilidad en porcentaje:', error);
        res.status(500).json({ error: 'Error al calcular la viabilidad en porcentaje del producto' });
    }
});

// Ruta para obtener conclusiones
router.post('/dashboard/functions/evaluacion2/conclusiones', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const { productName, productDescription, componentResponse, stagesResponse, marketResponse, acceptanceResponse, datesResponse, percentageResponse } = req.body;

    try {
        const conclusionsMessage = `
        Basado en un contexto colombiano y en la descripción del producto y las respuestas anteriores para "${productName}":
        
        Descripción del Producto: ${productDescription}
        Componentes del Prototipo: ${componentResponse}
        Etapas para desarrollar e implementar el prototipo: ${stagesResponse}
        Implementación en el mercado: ${marketResponse}
        Aceptación del mercado: ${acceptanceResponse}
        Costos, Tiempo, Cantidad de personas: ${datesResponse}
        Viabilidad en %: ${percentageResponse}

        Dame un párrafo corto de conclusiones sobre la idea.
        `;
        const conclusionsResponse = await openaiService.getChatGPTResponse(conclusionsMessage);
        
        // Devuelve la respuesta sin insertar en la base de datos todavía
        res.status(200).json({ response: conclusionsResponse.trim() });
    } catch (error) {
        console.error('Error al formular las conclusiones.', error);
        res.status(500).json({ error: 'Error al formular las conclusiones.' });
    }
});

// Nueva ruta para guardar todas las evaluaciones en la base de datos
router.post('/dashboard/functions/evaluacion2/guardar', authorizeRoles(['Analista de Datos']), async (req, res) => {
    const {
        productName,
        productDescription,
        componentResponse,
        stagesResponse,
        marketResponse,
        acceptanceResponse,
        datesResponse,
        percentageResponse,
        conclusionsResponse
    } = req.body;

    // Verificar que todas las respuestas existen y tienen contenido
    if (
        !productName || 
        !productDescription || 
        !componentResponse || 
        !stagesResponse || 
        !marketResponse || 
        !acceptanceResponse || 
        !datesResponse || 
        !percentageResponse || 
        !conclusionsResponse
    ) {
        return res.status(400).json({ error: 'Faltan datos necesarios para guardar la evaluación' });
    }

    let connection;
    try {
        // Inserta una nueva idea con fecha de creación actual y valores predeterminados para las columnas adicionales
        connection = await req.db.getConnection();
        const [result] = await connection.query(
            'INSERT INTO Ideas (nombre, alcance, usuario_email, estado, conclusiones, fecha_creacion, fecha_evaluacion) VALUES (?, ?, ?, ?, ?, NOW(), NOW())', 
            [
                productName, 
                productDescription, 
                req.session.user.email, 
                'En evaluación', 
                conclusionsResponse.trim()
            ]
        );
        const newIdeaId = result.insertId; // Obtiene el ID de la nueva idea

        // Inserta todos los datos en la tabla Evaluaciones
        await connection.query(
            `INSERT INTO Evaluaciones (idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                newIdeaId, 
                componentResponse.trim(), 
                stagesResponse.trim(), 
                marketResponse.trim(), 
                acceptanceResponse.trim(), 
                datesResponse.trim(), 
                percentageResponse.trim()
            ]
        );

        res.status(200).json({ success: true });
    } catch (dbError) {
        console.error('Error de base de datos:', dbError);
        res.status(500).json({ error: 'Error al guardar la evaluación del producto' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
