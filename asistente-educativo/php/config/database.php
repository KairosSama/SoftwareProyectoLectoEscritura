<?php
class Database {
    private $host = "localhost";
    private $port = "5433";
    private $db_name = "asistente_educativo";
    private $username = "postgres";
    private $password = "admin";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name}";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
            exit;
        }
        return $this->conn;
    }
}
