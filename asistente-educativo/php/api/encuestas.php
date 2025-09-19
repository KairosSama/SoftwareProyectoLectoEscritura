<?php
// php/api/encuestas.php
header("Content-Type: application/json");
session_start();
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $d = json_decode(file_get_contents('php://input'), true);

    $usuario_id = $d['usuario_id'] ?? null;
    $completada = isset($d['completada']) ? (int)$d['completada'] : 0;

    if (!$usuario_id) {
        http_response_code(400);
        echo json_encode(['error' => 'El usuario_id es obligatorio']);
        exit;
    }

    // Recolectar respuestas pregunta1...pregunta20
    $preguntas = [];
    for ($i = 1; $i <= 20; $i++) {
        $preguntas[] = isset($d["pregunta{$i}"]) ? (int)$d["pregunta{$i}"] : null;
    }

    $cols = implode(',', array_map(fn($i) => "pregunta{$i}", range(1, 20)));
    $placeholders = implode(',', array_fill(0, 20, '?'));

    $sql = "INSERT INTO encuestas (usuario_id, completada, {$cols}) VALUES (?, ?, {$placeholders})";
    $params = array_merge([$usuario_id, $completada], $preguntas);

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
    exit;
}

if ($method === 'GET') {
    $stmt = $db->query("SELECT e.*, u.nombre as usuario_nombre FROM encuestas e JOIN usuarios u ON e.usuario_id = u.id ORDER BY e.fecha DESC");
    $encuestas = $stmt->fetchAll();
    echo json_encode($encuestas);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
