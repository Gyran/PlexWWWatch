<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();

if (isset($_GET["item"])) {
    $item = 0 + $_GET["item"];
    try {
        $pwi = $plexWWWatch->plexWatchItem($item);
        echo json_encode([
            "item" => $pwi,
            "watched" => $pwi->getWatched()
        ]);
    } catch (Exception $e) {
        echo "{}";
    }
} else {
    echo "{}";
}


?>
