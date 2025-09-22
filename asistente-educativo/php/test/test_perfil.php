<?php
require_once __DIR__ . '/../models/PerfilAlumno.php';

// Configuración de conexión a la base de datos development
$host = "localhost";
$port = 5433;
$db = "asistente_educativo_dev"; // tu base de datos de development
$user = "postgres";
$pass = "admin";

// Crear instancia del modelo
$perfil = new PerfilAlumno($host, $port, $db, $user, $pass);

// Crear un usuario de prueba (debe existir en la tabla usuarios)
$usuario_id = 1; // asegúrate que este ID exista en la tabla usuarios
$curso_actual = "3° Básico";
$promedio = 6.5;
$aprobado = true;

// Insertar perfil
$idPerfil = $perfil->crearPerfil($usuario_id, $curso_actual, $promedio, $aprobado);
echo "Perfil creado con ID: $idPerfil\n";

// Recuperar perfil
$datos = $perfil->getPerfil($usuario_id);
echo "Datos del perfil:\n";
print_r($datos);
?>
