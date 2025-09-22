<?php
// Ruta de la carpeta uploads (dentro de php)
$uploads_dir = __DIR__ . '/uploads';  // ahora apunta directamente a php/uploads


// Crear la carpeta si no existe
if (!file_exists($uploads_dir)) {
    mkdir($uploads_dir, 0777, true);
}

// Verificar si se envió un archivo
if(isset($_FILES['pdf'])){
    $tmp_name = $_FILES['pdf']['tmp_name'];
    $name = basename($_FILES['pdf']['name']);

    // Mover el archivo subido a uploads
    if(move_uploaded_file($tmp_name, "$uploads_dir/$name")){
        echo "Archivo subido correctamente: $name";
    } else {
        echo "Error al subir el archivo: $name";
    }
} else {
    echo "No se recibió ningún archivo.";
}
?>
