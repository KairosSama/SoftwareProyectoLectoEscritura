<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Smalot\PdfParser\Parser;

class PdfParserHelper {
    private $parser;

    public function __construct() {
        $this->parser = new Parser();
    }

    public function parsePdf($filePath) {
        if (!file_exists($filePath)) {
            return null;
        }

        $pdf = $this->parser->parseFile($filePath);
        $text = $pdf->getText();

        return $text;
    }
}
