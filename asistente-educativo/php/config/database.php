<?php
// php/config/database.php
class Database {
    private $host = "localhost"; // Cambia si tu servidor no es local
    private $db_name = "asistente_educativo"; // Nombre de tu BD
    private $username = "root"; // Tu usuario MySQL
    private $password = "";     // Tu contraseña MySQL (vacío si usas XAMPP sin clave)
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_PERSISTENT => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ];
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "DB Connection error: " . $e->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
