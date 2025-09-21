<?php
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../config/database.php';

class AuthController {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function login($email, $password) {
        // Ejemplo de login básico
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email=:email AND password=:password");
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $password); // considera hashing en producción
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if($user){
            Response::json(["success" => true, "user" => $user]);
        } else {
            Response::json(["success" => false, "message" => "Credenciales incorrectas"], 401);
        }
    }
}
?>
