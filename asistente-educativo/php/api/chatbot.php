<?php
// php/api/chatbot.php
header("Content-Type: application/json");
session_start();
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'search') {
    $q = $_GET['q'] ?? '';
    if (!$q) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta el parámetro q']);
        exit;
    }

    // Buscar coincidencias
    $stmt = $db->prepare("SELECT * FROM conocimiento_chatbot WHERE pregunta LIKE ? LIMIT 1");
    $stmt->execute(["%$q%"]);
    $resp = $stmt->fetch();

    $respuesta = $resp ? $resp['respuesta'] : "Lo siento, no tengo una respuesta para esa pregunta.";

    // Guardar en logs
    $stmtLog = $db->prepare("INSERT INTO chatbot_logs (usuario_id, pregunta, respuesta) VALUES (?, ?, ?)");
    $usuario_id = $_SESSION['user']['id'] ?? null;
    $stmtLog->execute([$usuario_id, $q, $respuesta]);

    echo json_encode(['pregunta' => $q, 'respuesta' => $respuesta]);
    exit;
}

if ($method === 'POST' && $action === 'add') {
    // Solo admin debería poder
    if (!isset($_SESSION['user']) || $_SESSION['user']['tipo'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }

    $d = json_decode(file_get_contents('php://input'), true);
    $preg = $d['pregunta'] ?? '';
    $resp = $d['respuesta'] ?? '';
    $cat = $d['categoria'] ?? null;

    if (!$preg || !$resp) {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan datos']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO conocimiento_chatbot (pregunta,respuesta,categoria) VALUES (?, ?, ?)");
    $stmt->execute([$preg, $resp, $cat]);

    echo json_encode(['success'=>true,'id'=>$db->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'Método o acción no válida']);
