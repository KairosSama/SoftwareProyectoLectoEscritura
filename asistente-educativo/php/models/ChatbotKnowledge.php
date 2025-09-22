<?php
class ChatbotKnowledge {
    private $pdo;

    public function __construct($pdo){
        $this->pdo = $pdo;
    }

    public function findAnswer($question) {
        $stmt = $this->pdo->prepare("SELECT answer FROM chatbot_knowledge WHERE question ILIKE :q LIMIT 1");
        $stmt->execute(['q' => "%$question%"]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['answer'] : "No encontré respuesta en los manuales.";
    }
}
?>
