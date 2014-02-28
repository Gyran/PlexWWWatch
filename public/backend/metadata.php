<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
$plex = $plexWWWatch->plex();

$ratingKey = $_GET["ratingKey"];

echo json_encode($plex->metadata($ratingKey));

?>
