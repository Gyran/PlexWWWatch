<?php

require_once("plex-watch/PlexWatch.php");

class PlexWWWatch {
    private static $SETTINGS_FILE = "/settings/settings";

    public function settings() {
        if (!$this->_settings) {
            $this->_readSettings();
        }

        return $this->_settings;
    }

    public function plexWatch() {
        if (!$this->_plexWatch) {
            $settings = $this->settings();

            $this->_plexWatch = new PlexWatch($settings->dbPath, $settings->grouped);
        }
        return $this->_plexWatch;
    }

    private function _readSettings () {
        if (file_exists(self::$SETTINGS_FILE)) {
            $settings = json_encode(file_get_contents(self::$SETTINGS_FILE));
        } else {
            $settings = $this->_defaultSettings();
        }

        $this->_settings = $settings;
    }

    private function _defaultSettings() {
        $settings = new stdClass;
        $settings->dbPath = "/opt/plexWatch/plexWatch.db";
        $settings->grouped = false;
        $settings->plexMediaServerHost = "";

        return $settings;
    }

    private $_plexWatch = null;
    private $_settings = null;
}

?>
