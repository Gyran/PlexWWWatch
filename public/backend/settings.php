<?php

require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "POST") {
    $settingsJSON = file_get_contents('php://input');
    $settings = json_decode($settingsJSON);

    $plexWWWatch->saveSettings($settings);
}

echo json_encode($plexWWWatch->settings());

?>
