<?php

require_once(__DIR__ . "/../../PlexWWWatch.php");

try {
    $plexWWWatch = new PlexWWWatch();
    echo json_encode($plexWWWatch->plexWatch()->watched());
} catch (Exception $e) {
    echo "[]";
}


?>
