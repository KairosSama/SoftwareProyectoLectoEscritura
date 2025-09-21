<?php
require_once __DIR__ . '/PdfParserHelper.php';

$helper = new PdfParserHelper();
$uploadsDir = __DIR__ . '/../uploads';

foreach (glob($uploadsDir . '/*.pdf') as $pdfFile) {
    echo 'Leyendo archivo: ' . basename($pdfFile) . PHP_EOL;
    $text = $helper->parsePdf($pdfFile);
    if ($text === null) {
        echo 'No se pudo leer el archivo.' . PHP_EOL;
    } else {
        echo substr($text, 0, 300) . PHP_EOL; // Muestra los primeros 300 caracteres
    }
    echo str_repeat('-', 50) . PHP_EOL;
}
?>
