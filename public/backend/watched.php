<?php

require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
echo json_encode($plexWWWatch->plexWatch()->query());


?>
