<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
$plex = $plexWWWatch->plex();

$url = $_GET["url"];
$width = 0 + $_GET["width"];
$height = 0 + $_GET["height"];

$plex->image($url, $width, $height);

if (isset($_GET["recentlyAdded"])) {
    $plex->image($_GET["recentlyAdded"], 150, 225);
} else if (isset($_GET["recentlyWa"]))

?>
