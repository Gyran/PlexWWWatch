<?php
require_once("plex-watch/PlexWatch.php");

class PlexWWWatch {
    private static $SETTINGS_FILE = "/settings/settings";

    public function plexWatch() {
        if (!$this->_plexWatch) {
            $settings = $this->settings();

            $this->_plexWatch = new PlexWatch($settings->dbPath, $settings->grouped);
        }
        return $this->_plexWatch;
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

        if (!file_exists(__DIR__ . self::$SETTINGS_FILE)) {
            $fd = fopen(__DIR__ . self::$SETTINGS_FILE, "w");
            fclose($fd);
        }

        if (!is_writable(__DIR__ . self::$SETTINGS_FILE)) {
            $ret[] = "PlexWWWatch/settings/settings is not writable";
        }

        return $ret;
    }

    public function checkSettings($settings = null) {
        $ret = [];
        if ($settings === null) {
            $settings = $this->settings();
        }

        $validFields = ["dbPath", "plexMediaServerHost", "grouped"];
        foreach (get_object_vars($settings) as $key => $value) {
            if (!in_array($key, $validFields)) {
                $ret[] = "Key [" . $key . "] is not permitted";
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

    public function saveSettings ($settings) {
        $check = $this->checkSettings($settings);

        if (!empty($check)) {
            echo "ERROR!";
            print_r($check);
        } else {
            file_put_contents(__DIR__ . self::$SETTINGS_FILE, json_encode($settings));
        }
        return $settings;
    }

    private function _readSettings () {
        if (file_exists(__DIR__ . self::$SETTINGS_FILE)) {
            $settings = json_decode(file_get_contents(__DIR__ . self::$SETTINGS_FILE));
        } else {
            $settings = null;
        }

        $this->_settings = $settings;
    }

    private $_plexWatch = null;
    private $_settings = null;
}

?>
