CREATE DATABASE IF NOT EXISTS asistente_educativo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asistente_educativo;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  tipo ENUM('docente','estudiante','admin') NOT NULL DEFAULT 'estudiante',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de formularios
CREATE TABLE IF NOT EXISTS formularios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  telefono VARCHAR(20),
  curso_asignatura VARCHAR(100),
  comentarios TEXT,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de encuestas
CREATE TABLE IF NOT EXISTS encuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  completada TINYINT(1) DEFAULT 0,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pregunta1 TINYINT, pregunta2 TINYINT, pregunta3 TINYINT, pregunta4 TINYINT, pregunta5 TINYINT,
  pregunta6 TINYINT, pregunta7 TINYINT, pregunta8 TINYINT, pregunta9 TINYINT, pregunta10 TINYINT,
  pregunta11 TINYINT, pregunta12 TINYINT, pregunta13 TINYINT, pregunta14 TINYINT, pregunta15 TINYINT,
  pregunta16 TINYINT, pregunta17 TINYINT, pregunta18 TINYINT, pregunta19 TINYINT, pregunta20 TINYINT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de conocimiento del chatbot
CREATE TABLE IF NOT EXISTS conocimiento_chatbot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pregunta VARCHAR(255) NOT NULL,
  respuesta TEXT NOT NULL,
  categoria VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs de interacciones chatbot
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  pregunta TEXT,
  respuesta TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
