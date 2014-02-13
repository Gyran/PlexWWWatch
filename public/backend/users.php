<?php

require_once(__DIR__ . "/../../PlexWWWatch.php");

try {
    $plexWWWatch = new PlexWWWatch();
    if (isset($_GET["user"])) {
        $username = $_GET["user"];
        echo json_encode($plexWWWatch->plexWatch()->user($username), JSON_PRETTY_PRINT);
    } else {
        echo json_encode($plexWWWatch->plexWatch()->users());
    }
} catch (Exception $e) {
    echo "[]";
}


?>
