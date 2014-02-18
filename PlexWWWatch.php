<?php
require_once("plex-watch/PlexWatch.php");
require_once("plex/Plex.php");

class PlexWWWatchSettings implements JsonSerializable {
    public function __construct($file) {
        $this->_file = $file;
        $this->_load();
    }

    public function settings() {
        return $this->_settings;
    }

    public function save($newSettings) {
        $settings = $this->_populate($newSettings);
        $this->_save($settings);
    }

    private function _populate($newSettings) {
        $settings = $this->_default;

        if ($newSettings) {
            foreach ($this->_default as $category => $fields) {
                if (!isset($newSettings[$category])) {
                    continue;
                }

                foreach ($fields as $field => $default) {
                    $value = $default;
                    if (isset($newSettings[$category][$field])) {
                        $value = $newSettings[$category][$field];
                    }
                    $settings[$category][$field] = $value;
                }
            }
        }

        return $settings;
    }

    public function check($settings) {

    }

    public function jsonSerialize() {
        return $this->settings();
    }

    private function _load() {
        $json = @file_get_contents($this->_file);
        if ($json && $settings = json_decode($json, true)) {
            $this->_settings = $this->_populate($settings);
        } else {
            $this->_settings = $this->_default;
        }
    }

    private function _save($settings) {
        file_put_contents($this->_file, json_encode($settings));
    }

    private $_default = [
        "plexWatch" => [
            "dbFile" => "/opt/plexWatch/plexWatch.db",
            "grouped" => false
        ],
        "plex" => [
            "token" => "",
            "remote" => "http://localhost:32400",
            "local" => "http://127.0.0.1:32400",
        ],
        "plexWWWatch" => [
            "storeImages" => false,
            "requireAuth" => false,
            "requireAuthSettings" => false
        ]
    ];

    private $_file;
}

class PlexWWWatch {
    private static $SETTINGS_FILE = "/settings/settings";

    public function plexWatch() {
        if (!$this->_plexWatch) {
            $settings = $this->getSettings("plexWatch");
            $this->_plexWatch = new PlexWatch($settings["dbFile"], $settings["grouped"]);
        }
        return $this->_plexWatch;
    }

    public function plex() {
        if (!$this->_plex) {
            $settings = $this->getSettings("plex");

            $this->_plex = new Plex($settings["remote"], $settings["local"], $settings["token"]);
        }
        return $this->_plex;
    }

    public function getSettings($what = "") {
        $settings = $this->settings();
        if ($what !== "") {
            return $settings->settings()[$what];
        }
        return $settings->settings();
    }

    public function saveSettings($settings) {
        $this->settings()->save($settings);
    }

    public function check() {
        return array_merge($this->checkRequirements(), $this->checkSettings());
    }

    public function checkRequirements() {
        $ret = [];
        if (version_compare(phpversion(), "5.4", "<")) {
            $ret[] = "You need atleast PHP version 5.4";
        }

        /*if (!file_exists(__DIR__ . self::$SETTINGS_FILE)) {
            //$fd = fopen(__DIR__ . self::$SETTINGS_FILE, "w+");
            //fclose($fd);
            file_put_contents(__DIR__ . self::$SETTINGS_FILE, "asd");
        }*/

        /*if (!is_writable(__DIR__ . self::$SETTINGS_FILE)) {
            $ret[] = "PlexWWWatch/settings/settings is not writable";
        }*/

        return $ret;
    }

    public function checkSettings() {
        return $this->settings()->check();
    }

    private function settings() {
        if (!$this->_settings) {
            $this->_settings = new PlexWWWatchSettings(__DIR__ . self::$SETTINGS_FILE);
        }
        return $this->_settings;
    }

    private $_plex = null;
    private $_plexWatch = null;
    private $_settings = null;
}

?>
