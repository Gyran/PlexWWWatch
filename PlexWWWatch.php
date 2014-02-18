<?php
require_once("plex-watch/PlexWatch.php");
require_once("plex/Plex.php");

class PlexWWWatchSettings {
    public function __construct($file) {

    }

    public function check($settings) {

    }

    private function _load() {
        $json = file_get_contents($this->_file);
        if ($json) {
            $settings = json_decode($file, true);
            $this->_settings = $settings;
        }
    }

    private function _save() {
        file_put_contents($this->_file, json_encode($this->_settings));
    }

    private $_settings = [
        "plexWatch" => [
            "dbFile" => "",
            "grouped" => ""
        ],
        "plex" => [
            "token" => "",
            "remoteProtocol" => "http",
            "remoteAddress" => "",
            "remotePort" => 32400,
            "localProtocol" => "http",
            "localAddress" => "127.0.0.1",
            "localPost" => 32400
        ],
        "plexWWWatch" => [
            "storeImages" => false,
            "requireAuth" => false,
            "requireAuthSettings" => false
        ]
    ];

    //
    private $_file = "";
}

class PlexWWWatch {
    private static $SETTINGS_FILE = "/settings/settings";

    public function plexWatch() {
        if (!$this->_plexWatch) {
            $settings = $this->settings();

            if ($settings) {
                $this->_plexWatch = new PlexWatch($settings->dbPath, $settings->grouped);
            }
        }
        return $this->_plexWatch;
    }

    public function plex() {
        if (!$this->_plex) {
            $settings = $this->settings();

            if ($settings->plexMediaServerHost !== "") {
                $host = $settings->plexMediaServerHost;
                $token = isset($settings->myPlexToken) ? $settings->myPlexToken : "";
                $local = "";
                $this->_plex = new Plex($host, $local, $token);
            }
        }
        return $this->_plex;
    }

    public function settings() {
        if (!$this->_settings) {
            $this->_readSettings();
        }

        return $this->_settings;
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

    public function checkSettings($settings = null) {
        $ret = [];
        if ($settings === null) {
            $settings = $this->settings();
        }

        $validFields = ["dbPath", "plexMediaServerHost", "grouped", "correct", "plexMediaServerHostCorrect", "dbPathCorrect"];
        if ($settings) {
            foreach (get_object_vars($settings) as $key => $value) {
                if (!in_array($key, $validFields)) {
                    $ret[] = "Key [" . $key . "] is not permitted";
                }
            }
        }

        if (!isset($settings->dbPath) || $settings->dbPath === "") {
            $ret[] = "You must specify a dbPath";
        } else if (!is_readable($settings->dbPath)) {
            $ret[] = "Your database file must be readable";
        }

        if (!isset($settings->plexMediaServerHost) || $settings->plexMediaServerHost === "") {
            $ret[] = "You must specify a host to you Plex Media Server";
        }

        return $ret;
    }

    public function saveSettings ($settingsIn) {
        $settings = $this->settings();

        if (isset($settingsIn->dbPath)) {
            $settings->dbPath = $settingsIn->dbPath;
        }
        if (isset($settingsIn->plexMediaServerHost)) {
            $settings->plexMediaServerHost = $settingsIn->plexMediaServerHost;
        }
        if (isset($settingsIn->grouped)) {
            $settings->grouped = $settingsIn->grouped;
        }

        if ($settings) {
            file_put_contents(__DIR__ . self::$SETTINGS_FILE, json_encode($settings));
        }
        return $settings;
    }

    private function _emptySettings () {
        return (object)[
            "dbPath" => "",
            "plexMediaServerHost" => "",
            "grouped" => ""
        ];
    }

    private function _readSettings () {
        if (file_exists(__DIR__ . self::$SETTINGS_FILE)) {
            $settings = json_decode(file_get_contents(__DIR__ . self::$SETTINGS_FILE));
        } else {
            $settings = $this->_emptySettings();
        }

        $this->_settings = $settings;
    }

    private $_plex = null;
    private $_plexWatch = null;
    private $_settings = null;
}

?>
