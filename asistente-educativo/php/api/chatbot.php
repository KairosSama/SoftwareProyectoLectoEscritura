<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../controllers/ChatbotController.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['question']) || trim($input['question']) === '') {
    echo json_encode(['error' => 'No question provided']);
    exit;
}

$question = $input['question'];

$chatbot = new ChatbotController();
$response = $chatbot->answerQuestion($question);

echo json_encode(['answer' => $response]);
