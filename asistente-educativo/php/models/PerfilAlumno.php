<?php
class PerfilAlumno {
    private $pdo;

    public function __construct($host, $port, $db, $user, $pass) {
        try {
            $this->pdo = new PDO("pgsql:host=$host;port=$port;dbname=$db", $user, $pass);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }

    public function crearPerfil($usuario_id, $curso_actual, $promedio, $aprobado) {
        $stmt = $this->pdo->prepare(
            "INSERT INTO perfiles_alumnos(usuario_id, curso_actual, promedio, aprobado) 
            VALUES (:usuario_id, :curso_actual, :promedio, :aprobado)"
        );
        $stmt->execute([
            ':usuario_id' => $usuario_id,
            ':curso_actual' => $curso_actual,
            ':promedio' => $promedio,
            ':aprobado' => $aprobado
        ]);
        return $this->pdo->lastInsertId();
    }

    public function getPerfil($usuario_id) {
        $stmt = $this->pdo->prepare("SELECT * FROM perfiles_alumnos WHERE usuario_id = :usuario_id");
        $stmt->execute([':usuario_id' => $usuario_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
