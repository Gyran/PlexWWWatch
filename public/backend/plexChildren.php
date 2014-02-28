<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();

if (isset($_GET["item"])) {
    $item = 0 + $_GET["item"];
    try {
        echo json_encode($plexWWWatch->plexChildren($item));
    } catch (Exception $e) {
        echo "[]";
    }
} else {
    echo "[]";
}


?>
