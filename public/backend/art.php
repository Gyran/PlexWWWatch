<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
$plex = $plexWWWatch->plex();

if (isset($_GET["thumb"])) {
    $plex->thumb($_GET["thumb"]);
}

?>
