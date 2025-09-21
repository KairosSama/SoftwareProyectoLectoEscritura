<?php
class Auth {
    public static function check($token) {
        // Aquí podrías validar JWT o token de sesión
        return $token === "token_de_prueba"; // ejemplo temporal
    }
}
?>
