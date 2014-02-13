<?php
class PlexWatchUser implements JsonSerializable {

    public function __construct($username) {
        $this->name = $username;
        $this->platforms = array();
        $this->id = -1;
        $this->thumb = "";
        $this->timeWatched = 0;
        $this->episodesWatched = 0;
        $this->moviesWatched = 0;
        $this->lastWatchedAt = 0;
    }

    public function addWatched($watched) {
        $xml = $watched->xml;
        if ($this->id < 0 && isset($xml->User["id"])) {
            $this->id = $xml->User["id"]->__toString();
        }

        if ($this->thumb === "" && isset($xml->User["thumb"])) {
            $this->thumb = $xml->User["thumb"]->__toString();
        }

        if ($this->lastWatchedAt < $watched->time) {
            $this->lastWatchedAt = $watched->time;
        }

        switch ($watched->type) {
            case "movie":
                $this->moviesWatched = $this->moviesWatched + 1;
                break;
            case "episode":
                $this->episodesWatched = $this->episodesWatched + 1;
                break;
        }

        $this->timeWatched = $this->timeWatched + $watched->timeWatched;
        $this->_addPlatform($watched);
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    protected function _addPlatform($watched) {
        $platfrom = $watched->platform;
        if (!in_array($platfrom, $this->platforms)) {
            $this->platforms[] = $platfrom;
        }
    }

    protected $jsonFields = array(
        "id", "name", "platforms", "thumb", "timeWatched",
        "moviesWatched", "episodesWatched", "lastWatchedAt"
    );

    public $id;
    public $name;
    public $platforms;
    public $thumb;
    public $timeWatched;
    public $moviesWatched;
    public $episodesWatched;
}
?>
