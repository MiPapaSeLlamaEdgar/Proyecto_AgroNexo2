    -- Drop the database if it exists
    DROP DATABASE IF EXISTS GestionAgricola;

    -- Create the database
    CREATE DATABASE IF NOT EXISTS GestionAgricola;
    USE GestionAgricola;

    -- Table Users
    CREATE TABLE IF NOT EXISTS Users (
        email VARCHAR(100) NOT NULL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL
    );

    -- Table Roles
    CREATE TABLE IF NOT EXISTS Roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );

    -- Intermediate table for Users-Roles relationship
    CREATE TABLE IF NOT EXISTS UserRoles (
        user_email VARCHAR(100),
        role_id INT,
        FOREIGN KEY (user_email) REFERENCES Users(email) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_email, role_id)
    );

    -- Insert roles into the Roles table, only those used now plus "Usuarios"
    INSERT INTO Roles (name) VALUES 
    ('Analista de Datos'),
    ('Administrador'),
    ('Usuarios') 
    ON DUPLICATE KEY UPDATE name=name; -- This avoids duplicate entries if the script is run again

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
        FOREIGN KEY (usuario_email) REFERENCES Users(email) ON DELETE SET NULL
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

    select * from Evaluaciones;