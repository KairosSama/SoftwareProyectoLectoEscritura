<?php
if(isset($_FILES['pdf'])){
    $uploads_dir = __DIR__ . '/../uploads';
    if (!file_exists($uploads_dir)) {
        mkdir($uploads_dir, 0777, true);
    }
    $tmp_name = $_FILES['pdf']['tmp_name'];
    $name = basename($_FILES['pdf']['name']);
    if(move_uploaded_file($tmp_name, "$uploads_dir/$name")){
        echo json_encode(["message" => "Archivo subido correctamente: $name"]);
    } else {
        echo json_encode(["error" => "Error al subir el archivo"]);
    }
} else {
    echo json_encode(["error" => "No se recibió ningún archivo"]);
}
?>
