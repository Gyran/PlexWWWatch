<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
$plex = $plexWWWatch->plex();

echo json_encode($plex->recentlyAdded());

?>
