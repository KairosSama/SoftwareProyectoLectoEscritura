-- Crear la base de datos (ejecutar solo si no existe)
-- CREATE DATABASE asistente_educativo;

-- Conectarse a la base de datos
-- \c asistente_educativo;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('docente','estudiante','admin')) DEFAULT 'estudiante',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de formularios
CREATE TABLE IF NOT EXISTS formularios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    curso_asignatura VARCHAR(100),
    comentarios TEXT,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de encuestas (20 preguntas)
CREATE TABLE IF NOT EXISTS encuestas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    completada BOOLEAN DEFAULT false,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pregunta1 INT, pregunta2 INT, pregunta3 INT, pregunta4 INT, pregunta5 INT,
    pregunta6 INT, pregunta7 INT, pregunta8 INT, pregunta9 INT, pregunta10 INT,
    pregunta11 INT, pregunta12 INT, pregunta13 INT, pregunta14 INT, pregunta15 INT,
    pregunta16 INT, pregunta17 INT, pregunta18 INT, pregunta19 INT, pregunta20 INT
);

-- Tabla de conocimiento del chatbot
CREATE TABLE IF NOT EXISTS conocimiento_chatbot (
    id SERIAL PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de documentos PDF cargados
CREATE TABLE IF NOT EXISTS chatbot_docs (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs del chatbot
CREATE TABLE IF NOT EXISTS chatbot_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    pregunta TEXT,
    respuesta TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NUEVA: Tabla de perfiles de alumnos
CREATE TABLE IF NOT EXISTS perfiles_alumnos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_actual VARCHAR(50),
    promedio NUMERIC(5,2),
    aprobado BOOLEAN,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
