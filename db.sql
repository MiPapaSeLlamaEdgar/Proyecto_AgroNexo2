-- Drop the database if it exists
DROP DATABASE IF EXISTS GestionAgricola;

-- Create the database
CREATE DATABASE IF NOT EXISTS GestionAgricola;
USE GestionAgricola;

-- Create the Roles table
CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create the Users table
CREATE TABLE IF NOT EXISTS Users (
    email VARCHAR(100) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE SET NULL -- Evita borrar usuarios al borrar un rol
);

-- Intermediate table for Users-Roles relationship (if needed)
CREATE TABLE IF NOT EXISTS UserRoles (
    user_email VARCHAR(100),
    role_id INT,
    FOREIGN KEY (user_email) REFERENCES Users(email) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_email, role_id)
);

-- Create the Ideas table
CREATE TABLE IF NOT EXISTS Ideas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    alcance TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_evaluacion TIMESTAMP NULL,
    usuario_email VARCHAR(100),
    estado ENUM('Pendiente', 'En Proceso', 'Finalizado', 'En evaluación') DEFAULT 'Pendiente',
    conclusiones TEXT,
    FOREIGN KEY (usuario_email) REFERENCES Users(email) ON DELETE CASCADE
);

-- Create the Evaluations table
CREATE TABLE IF NOT EXISTS Evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idea_id INT,
    componentes TEXT,
    etapas TEXT,
    mercado TEXT,
    aceptacion TEXT,
    datos TEXT,
    viabilidad_porcentaje TEXT,
    creadoEn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES Ideas(id) ON DELETE CASCADE
);

-- Insert roles into the Roles table
INSERT INTO Roles (name) VALUES 
('Administrador'),
('Analista de Datos'),
('Usuarios')
ON DUPLICATE KEY UPDATE name=name;

-- Insert users into the Users table with temporary passwords
INSERT INTO Users (email, name, password, role_id)
VALUES 
    ('usuario1@ejemplo.com', 'Usuario Uno', 'password123', 3),
    ('usuario2@ejemplo.com', 'Usuario Dos', 'password123', 2),
    ('usuario3@ejemplo.com', 'Usuario Tres', 'password123', 3);

-- Insert data into the Ideas table
INSERT INTO Ideas (nombre, alcance, usuario_email, estado, conclusiones, fecha_creacion)
VALUES 
    ('Idea de Riego Inteligente', 'Desarrollar un sistema de riego automatizado basado en sensores de humedad', 'usuario1@ejemplo.com', 'Pendiente', 'Esperando evaluación.', NOW()),
    ('Sistema de Cultivo Vertical', 'Crear un sistema para maximizar el uso de espacio en cultivos urbanos', 'usuario2@ejemplo.com', 'En evaluación', 'En proceso de evaluación.', NOW()),
    ('Plataforma de Ventas Agrícolas', 'Desarrollar una plataforma en línea para conectar agricultores y consumidores', 'usuario3@ejemplo.com', 'En Proceso', 'Desarrollo en curso.', NOW()),
    ('Análisis de Suelo', 'Desarrollar un sistema de análisis de suelo utilizando inteligencia artificial', 'usuario1@ejemplo.com', 'Pendiente', 'Revisión pendiente.', NOW());

-- Insert data into the Evaluations table
INSERT INTO Evaluaciones (idea_id, componentes, etapas, mercado, aceptacion, datos, viabilidad_porcentaje)
VALUES 
    (1, 'Sensor de humedad, Sistema de control', 'Etapa 1: Diseño, Etapa 2: Implementación', 'Mercado Local', 'Alta', 'Datos preliminares indican una alta eficiencia', '90%'),
    (2, 'Estructura vertical, Sistema de riego', 'Etapa 1: Prototipo, Etapa 2: Pruebas', 'Mercado Urbano', 'Moderada', 'Pruebas iniciales muestran buenos resultados', '75%'),
    (3, 'Plataforma web, Módulo de pagos', 'Etapa 1: Diseño, Etapa 2: Desarrollo', 'Mercado Global', 'Alta', 'Evaluación de mercado positiva', '85%'),
    (4, 'Sensor de pH, Análisis de nutrientes', 'Etapa 1: Investigación, Etapa 2: Desarrollo', 'Mercado Rural', 'Baja', 'Datos de muestras de suelo recolectados', '60%');
