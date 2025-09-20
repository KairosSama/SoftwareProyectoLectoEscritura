<?php
// php/api/export.php
require_once __DIR__ . '/../config/database.php';
require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$db = (new Database())->getConnection();

$sql = "SELECT u.id as usuario_id, u.nombre, u.email, e.id as encuesta_id, e.fecha
        FROM usuarios u
        LEFT JOIN encuestas e ON e.usuario_id = u.id
        ORDER BY u.id";
$stmt = $db->query($sql);
$rows = $stmt->fetchAll();

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Cabecera
$sheet->fromArray(['Usuario ID','Nombre','Email','Encuesta ID','Fecha'], null, 'A1');

// Datos
$r = 2;
foreach ($rows as $row) {
    $sheet->setCellValue("A{$r}", $row['usuario_id']);
    $sheet->setCellValue("B{$r}", $row['nombre']);
    $sheet->setCellValue("C{$r}", $row['email']);
    $sheet->setCellValue("D{$r}", $row['encuesta_id']);
    $sheet->setCellValue("E{$r}", $row['fecha']);
    $r++;
}

// Descargar
$filename = "matriz_resultados_" . date('Ymd_His') . ".xlsx";
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header("Content-Disposition: attachment; filename=\"{$filename}\"");
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
