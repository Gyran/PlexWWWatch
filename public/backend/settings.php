<?php
require_once(__DIR__ . "/../../PlexWWWatch.php");

$plexWWWatch = new PlexWWWatch();
$method = $_SERVER['REQUEST_METHOD'];

if (isset($_GET["all"])) {
    // get all settings
    echo json_encode($plexWWWatch->getSettings());
} else if ($method === "POST") {
    // save
    $json = file_get_contents("php://input");
    $settings = json_decode($json, true);

    $plexWWWatch->saveSettings($settings);
} else {
    echo json_encode($plexWWWatch->getSettings("plexWWWatch"));
}

?>
