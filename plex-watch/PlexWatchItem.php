<?php

class PlexWatchItem implements JsonSerializable {
    public $numWatches = 0;
    public $timeWatched = 0;
    public $numCompleted = 0;

    public function __construct($itemId) {
        $this->id = $itemId;
        $this->watched = [];
    }

    public function getWatched () {
        return $this->watched;
    }

    public function addWatched($watched) {
        $this->numWatches += 1;
        $this->timeWatched += $watched->timeWatched;

        if ($watched->progress >= 100) {
            $this->numCompleted += 1;
        }

        $this->watched[] = $watched;
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    private $jsonFields = [
        "id", "numWatches", "timeWatched", "numCompleted"
    ];
}

?>
