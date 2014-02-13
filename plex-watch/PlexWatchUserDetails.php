<?php
require_once("PlexWatchUser.php");

class PlexWatchUserDetails extends PlexWatchUser {
    public function __construct($username) {
        parent::__construct($username);

        $this->jsonFields[] = "watched";
    }

    public function addWatched($watched) {
        parent::addWatched($watched);

        $this->watched[] = $watched;
    }

    protected function _addPlatform($watched) {
        $platformName = $watched->platform;
        if (!isset($this->platforms[$platformName])) {
            $platform = [
                "watches" => 0,
                "platform" => "",
                "timeWatched" => 0
            ];

            if (isset($watched->xml->Player["platform"])) {
                $platform["platform"] = $watched->xml->Player["platform"]->__toString();
            }

            $this->platforms[$platformName] = $platform;

        }
        $this->platforms[$platformName]["watches"] += 1;
        $this->platforms[$platformName]["timeWatched"] += $watched->timeWatched;
    }

    public $watched;
}

?>
