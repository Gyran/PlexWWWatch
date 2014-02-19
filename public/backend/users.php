<?php

require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();

if (isset($_GET["user"])) {
    $username = $_GET["user"];
    try {
        echo json_encode($plexWWWatch->plexWatch()->user($username));
    } catch (Exception $e) {
        echo "{watched: []}";
    }
} else {
    try {
        echo json_encode($plexWWWatch->plexWatch()->users());
    }  catch (Exception $e) {
        echo "[]";
    }
}


?>
