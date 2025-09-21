<?php
class User {
    public $id;
    public $name;
    public $email;
    public $password;

    public function __construct($data = []) {
        if(!empty($data)){
            $this->id = $data['id'] ?? null;
            $this->name = $data['name'] ?? null;
            $this->email = $data['email'] ?? null;
            $this->password = $data['password'] ?? null;
        }
    }
}
?>
