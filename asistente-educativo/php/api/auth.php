<?php
// php/api/auth.php
header("Content-Type: application/json");
session_start();
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';

    // Registro
    if ($action === 'register') {
        $data = json_decode(file_get_contents('php://input'), true);
        $nombre = trim($data['nombre'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$nombre || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan datos']);
            exit;
        }

        $stmt = $db->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email ya registrado']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO usuarios (nombre, email, password, tipo) VALUES (?, ?, ?, 'estudiante')");
        $stmt->execute([$nombre, $email, $hash]);

        echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
        exit;
    }

    // Login
    if ($action === 'login') {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        $stmt = $db->prepare("SELECT id, nombre, email, password, tipo FROM usuarios WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales inválidas']);
            exit;
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'nombre' => $user['nombre'],
            'email' => $user['email'],
            'tipo' => $user['tipo']
        ];

        echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
