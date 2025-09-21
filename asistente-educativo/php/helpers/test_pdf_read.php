<?php
require_once __DIR__ . "/PdfParserHelper.php";

$helper = new PdfParserHelper();
$uploads_dir = __DIR__ . "/../uploads";

foreach (glob($uploads_dir . "/*.pdf") as $file) {
    echo "Leyendo archivo: " . basename($file) . PHP_EOL;
    $text = $helper->parsePdf($file);
    if ($text === null) {
        echo "No se pudo leer el archivo." . PHP_EOL;
    } else {
        echo substr($text, 0, 500) . PHP_EOL;
    }
    echo str_repeat("-", 50) . PHP_EOL;
}
?>
