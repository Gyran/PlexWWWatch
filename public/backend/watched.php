<?php

require_once(__DIR__ . "/../../PlexWWWatch.php");

try {
    $plexWWWatch = new PlexWWWatch();
    echo json_encode($plexWWWatch->plexWatch()->query());
} catch (Exception $e) {
    echo "[]";
}


?>
