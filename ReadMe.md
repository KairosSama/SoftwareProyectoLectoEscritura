# 🎓 Asistente Virtual Educativo

Sistema web integral para gestión educativa que incluye formularios, encuestas, matriz de resultados, área docente y chatbot asistente.

---

## 🚀 Características

- **Formulario de datos**: Captura información de estudiantes y docentes
- **Sistema de encuestas**: 20 preguntas con filtros y sistema de calificación
- **Matriz de resultados**: Visualización de datos en tablas
- **Área docente**: Interfaz exclusiva para profesores
- **Chatbot integrado**: Asistente virtual para estudiantes
- **Diseño responsive**: Compatible con todos los dispositivos
- **Base de datos**: PostgreSQL para almacenamiento persistente

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: PHP
- **Base de datos**: PostgreSQL
- **Iconos**: Font Awesome
- **Gráficos**: Chart.js (para futuras implementaciones)

---

## 🗄️ Esquema de Base de Datos

### Tabla: `usuarios`
| Campo          | Tipo           | Descripción                  |
|----------------|---------------|------------------------------|
| id             | INT           | Identificador único          |
| nombre         | VARCHAR(100)  | Nombre completo              |
| email          | VARCHAR(100)  | Correo electrónico           |
| password       | VARCHAR(255)  | Contraseña cifrada           |
| tipo           | ENUM          | 'docente', 'estudiante', 'admin' |
| fecha_registro | TIMESTAMP     | Fecha de registro            |

### Tabla: `formularios`
| Campo           | Tipo          | Descripción                  |
|-----------------|---------------|------------------------------|
| id              | INT           | Identificador único          |
| usuario_id      | INT           | ID del usuario               |
| nombre_completo | VARCHAR(150)  | Nombre completo              |
| email           | VARCHAR(100)  | Correo electrónico           |
| telefono        | VARCHAR(20)   | Número de teléfono           |
| curso_asignatura| VARCHAR(100)  | Curso o asignatura           |
| comentarios     | TEXT          | Comentarios adicionales      |
| fecha_envio     | TIMESTAMP     | Fecha de envío               |

### Tabla: `encuestas`
| Campo       | Tipo       | Descripción                  |
|-------------|-----------|------------------------------|
| id          | INT       | Identificador único          |
| usuario_id  | INT       | ID del usuario               |
| pregunta1   | INT       | Respuesta pregunta 1         |
| ...         | ...       | ...                          |
| pregunta20  | INT       | Respuesta pregunta 20        |
| completada  | BOOLEAN   | Estado de completitud        |
| fecha       | TIMESTAMP | Fecha de respuesta           |

### Tabla: `perfiles_alumnos`
| Campo          | Tipo       | Descripción                  |
|----------------|-----------|------------------------------|
| id             | INT       | Identificador único          |
| usuario_id     | INT       | ID del usuario               |
| curso_actual   | VARCHAR   | Curso actual del estudiante  |
| promedio       | NUMERIC   | Promedio de notas            |
| aprobado       | BOOLEAN   | Indica si aprobó el curso    |
| fecha_registro | TIMESTAMP | Fecha de registro            |

---

## ⚙️ Configuración del Entorno

### Requisitos Previos
- Servidor web (Apache, Nginx)
- PHP 7.4 o superior
- PostgreSQL 12 o superior
- Navegador moderno

📝 Historias de Usuario

HU01: Como docente, quiero acceder a un panel exclusivo.

HU02: Como estudiante, quiero completar encuestas.

HU03: Como usuario, quiero interactuar con un chatbot.

HU04: Como administrador, quiero ver la matriz de resultados.

👥 Roles y Responsabilidades

Project Manager: Coordinación general

Desarrollador Frontend: Implementación de la UI

Desarrollador Backend: Lógica y base de datos

Diseñador UX/UI: Experiencia de usuario

Tester: Control de calidad

📊 Métricas de Éxito

95% de funcionalidades implementadas según lo planeado

Tiempo de respuesta < 2 segundos

Interfaz accesible según WCAG 2.1

Satisfacción del usuario > 4/5

🚀 Próximos Pasos

Sistema de autenticación de usuarios

Panel de administración docente

Exportación de matriz de resultados

Mejorar respuestas del chatbot

Pruebas de usabilidad

