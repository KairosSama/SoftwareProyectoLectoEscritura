# 🎓 Asistente Virtual Educativo

Sistema web integral para gestión educativa que incluye formularios de datos, encuestas, matriz de resultados, área docente y chatbot asistente.

---

## 🚀 Características

- **Formulario de datos**: Captura información de estudiantes y docentes
- **Sistema de encuestas**: 20 preguntas con filtros y sistema de calificación
- **Matriz de resultados**: Visualización de datos en tablas de 5 columnas
- **Área docente**: Interfaz exclusiva para profesores
- **Chatbot integrado**: Asistente virtual para estudiantes
- **Diseño responsive**: Compatible con todos los dispositivos
- **Base de datos**: MySQL para almacenamiento persistente

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: PHP
- **Base de datos**: MySQL
- **Iconos**: Font Awesome
- **Charting**: Chart.js (para futuras implementaciones)

---

## 📋 Estructura del Proyecto

asistente-educativo/ │ ├── index.html # Página principal ├── styles/ # Directorio de estilos CSS │ └── main.css # Estilos principales ├── scripts/ # Directorio de scripts JavaScript │ └── app.js # Lógica de la aplicación ├── php/ # Directorio de scripts PHP │ ├── config/ # Configuración │ │ └── database.php # Conexión a la base de datos │ ├── models/ # Modelos de datos │ ├── controllers/ # Controladores │ └── api/ # Endpoints API ├── assets/ # Recursos multimedia └── README.md # Este archivo

Código

---

## 🗄️ Esquema de Base de Datos

### Tabla: `usuarios`
| Campo          | Tipo           | Descripción                  |
|----------------|---------------|------------------------------|
| id             | INT           | Identificador único          |
| nombre         | VARCHAR(100)  | Nombre completo              |
| email          | VARCHAR(100)  | Correo electrónico           |
| password       | VARCHAR(255)  | Contraseña cifrada           |
| tipo           | ENUM          | 'docente' o 'estudiante'     |
| fecha_registro | TIMESTAMP     | Fecha de registro            |

### Tabla: `formularios`
| Campo           | Tipo           | Descripción                  |
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

### Tabla: `conocimiento_chatbot`
| Campo          | Tipo           | Descripción                  |
|----------------|---------------|------------------------------|
| id             | INT           | Identificador único          |
| pregunta       | VARCHAR(255)  | Pregunta frecuente           |
| respuesta      | TEXT          | Respuesta del chatbot        |
| categoria      | VARCHAR(50)   | Categoría de la pregunta     |
| fecha_creacion | TIMESTAMP     | Fecha de creación            |

---

## ⚙️ Configuración del Entorno

### Requisitos Previos
- Servidor web (Apache, Nginx)
- PHP 7.4 o superior
- MySQL 5.7 o superior
- Navegador web moderno

### Instalación
1. Clonar o descargar el proyecto en el directorio del servidor web.
2. Crear la base de datos MySQL:
   ```sql
   CREATE DATABASE asistente_educativo;
Importar el esquema de la base de datos (ubicado en database/schema.sql).

Configurar la conexión a la base de datos en php/config/database.php:

php
private $host = "localhost";
private $db_name = "asistente_educativo";
private $username = "tu_usuario";
private $password = "tu_password";
Acceder al proyecto mediante el navegador.

📝 Historias de Usuario
HU01: Como docente, quiero acceder a un panel exclusivo Criterios de aceptación:

El docente puede iniciar sesión con sus credenciales.

Se muestra un dashboard con opciones exclusivas.

Los estudiantes no pueden acceder a esta área.

HU02: Como estudiante, quiero completar encuestas sobre mis asignaturas Criterios de aceptación:

Las encuestas tienen 20 preguntas con opciones de 1 a 5.

Los estudiantes pueden guardar y continuar después.

Las respuestas se almacenan correctamente.

HU03: Como usuario, quiero interactuar con un chatbot para resolver dudas Criterios de aceptación:

El chatbot responde a preguntas frecuentes.

Las interacciones quedan registradas.

El conocimiento del chatbot es editable por administradores.

HU04: Como administrador, quiero ver una matriz con los resultados Criterios de aceptación:

La matriz muestra 5 columnas de datos.

Los datos se pueden exportar a Excel.

Hay opciones de filtrado disponibles.

🔄 Flujo de Trabajo de Desarrollo
Planificación: Priorizar historias de usuario para el sprint.

Desarrollo: Implementar funcionalidades según el sprint backlog.

Pruebas: Verificar el funcionamiento de cada feature.

Revisión: Revisión de código y ajustes necesarios.

Despliegue: Publicación en servidor de pruebas/producción.

👥 Roles y Responsabilidades
Project Manager: Coordinación general y comunicación con stakeholders.

Desarrollador Frontend: Implementación de la interfaz de usuario.

Desarrollador Backend: Lógica de negocio y base de datos.

Diseñador UX/UI: Experiencia de usuario e interfaz visual.

Tester: Pruebas y control de calidad.

📊 Métricas de Éxito
95% de funcionalidades implementadas según lo planeado.

Tiempo de respuesta del sistema menor a 2 segundos.

Interfaz accesible según estándares WCAG 2.1.

Satisfacción del usuario superior a 4/5 en pruebas de usabilidad.

🚀 Próximos Pasos
Implementar sistema de autenticación de usuarios.

Desarrollar el backend PHP para persistencia de datos.

Crear panel de administración para docentes.

Implementar exportación a Excel de la matriz de resultados.

Mejorar el algoritmo de respuestas del chatbot.

Realizar pruebas de usabilidad con usuarios reales.

📞 Soporte
Email: desarrollo@asistenteeducativo.com

Sistema de tickets: [Sistema de tickets del proyecto]