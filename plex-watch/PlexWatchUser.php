<?php
class PlexWatchUser implements JsonSerializable {

    public function __construct($username, $plexWatch = null) {
        $this->name = $username;
        $this->displayName = $this->name;
        $this->devices = array();
        $this->id = -1;
        $this->thumb = "";
        $this->totalWatched = ["watches" => 0, "timeWatched" => 0];
        $this->lastWatchedAt = 0;
        $this->types = array();

        if (isset($plexWatch)) {
            $this->displayName = $plexWatch->userDisplayName($username);
        }
    }

    public function addWatched($watched) {
        $this->_addId($watched);
        $this->_addThumb($watched);
        $this->_addLastWatched($watched);
        $this->_addType($watched);
        $this->_addTimeWatched($watched);
        $this->_addDevice($watched);
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    protected function _addThumb($watched) {
        if ($this->thumb === "" && isset($watched->xml->User["thumb"])) {
            $this->thumb = $watched->xml->User["thumb"]->__toString();
        }
    }

    protected function _addId($watched) {
        if ($this->id < 0 && isset($watched->xml->User["id"])) {
            $this->id = $watched->xml->User["id"]->__toString();
        }
    }

    protected function _addLastWatched($watched) {
        if ($this->lastWatchedAt < $watched->time) {
            $this->lastWatchedAt = $watched->time;
        }
    }

    protected function _addTimeWatched($watched) {
        $this->totalWatched["watches"] += 1;
        $this->totalWatched["timeWatched"] += $watched->timeWatched;
    }

    protected function _addType($watched) {
        $type = $watched->type;
        if (!isset($this->types[$type])) {
            $this->types[$type] = 1;
        } else {
            $this->types[$type] += 1;
        }
    }

    protected function _addDevice($watched) {
        $device = $watched->device;
        if (!in_array($device, $this->devices)) {
            $this->devices[] = $device;
        }
    }

    protected $jsonFields = array(
        "id", "name", "devices", "thumb", "totalWatched",
        "lastWatchedAt", "types", "displayName"
    );

    public $id;
    public $name;
    public $displayName;
    public $devices;
    public $thumb;
    public $totalWatched;
    public $moviesWatched;
    public $episodesWatched;
}
?>
