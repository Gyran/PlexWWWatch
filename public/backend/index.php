<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

define("BASE_PATH", __DIR__ . "/../..");
define("SETTINGS_FILE", BASE_PATH . "/settings/settings");

require_once(BASE_PATH . "/plex-watch/PlexWatch.php");

// get settings
if (file_exists(SETTINGS_FILE)) {
    $settings = json_decode(file_get_contents(SETTINGS_FILE));
} else {
    $settings = new stdClass();
    $settings->dbPath = "/opt/plexWatch/plexWatch.db";
    $settings->grouped = false;
    $settings->plexMediaServerHost = "";
}

require_once(BASE_PATH . "/vendor/autoload.php");
$klein = new \Klein\Klein();

$klein->respond("GET", "/backend/watched/?", function ($request, $respons) use ($settings) {
    $pw = new PlexWatch($settings->dbPath, $settings->grouped);
    return json_encode($pw->query(), JSON_PRETTY_PRINT);
});

$klein->respond("GET", "/backend/settings/?", function () use ($settings) {
    return json_encode($settings);
});

$klein->respond("POST", "/backend/settings/?", function ($request, $respons) {
    $settingsJSON = file_get_contents('php://input');
    $settings = json_decode($settingsJSON);

    if ($settings) {
        file_put_contents(SETTINGS_FILE, json_encode($settings));
    }
    return json_encode($settings);
});

$klein->dispatch();

?>
