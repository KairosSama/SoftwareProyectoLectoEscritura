<?php
require_once __DIR__ . '/../helpers/PdfParserHelper.php';

class ChatbotController {
    private $pdfHelper;
    private $pdfTexts = [];

    public function __construct() {
        $this->pdfHelper = new PdfParserHelper();
        $this->loadPdfs();
    }

    private function loadPdfs() {
        $uploadsDir = __DIR__ . '/../uploads';
        foreach (glob($uploadsDir . '/*.pdf') as $pdfFile) {
            $text = $this->pdfHelper->parsePdf($pdfFile);
            if ($text !== null) {
                $this->pdfTexts[] = mb_strtolower($text);
            }
        }
    }

    public function answerQuestion($question) {
        $questionLower = mb_strtolower($question);

        $matches = [];

        foreach ($this->pdfTexts as $text) {
            if (strpos($text, $questionLower) !== false) {
                $pos = strpos($text, $questionLower);
                $start = max(0, $pos - 150);
                $length = min(300, strlen($text) - $start);
                $fragment = substr($text, $start, $length);
                $matches[] = $fragment;
            }
        }

        if (count($matches) === 0) {
            return "No encontré información relacionada en los manuales, intenta formular tu pregunta de otra manera.";
        }

        $answer = implode("\n...\n", $matches);
        $answer = preg_replace("/\s+/", " ", $answer);
        return $answer;
    }
}
