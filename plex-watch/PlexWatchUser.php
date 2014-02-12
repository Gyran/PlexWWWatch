<?php
class PlexWatchUser implements JsonSerializable {

    public function __construct($username) {
        $this->name = $username;
        $this->platforms = array();
        $this->id = -1;
        $this->thumb = "";

    }

    public function addWatched($watched) {
        $xml = new SimpleXmlElement($watched->xml);
        if ($this->id < 0 && isset($xml->User["id"])) {
            $this->id = $xml->User["id"]->__toString();
        }

        if ($this->thumb === "" && isset($xml->User["thumb"])) {
            $this->thumb = $xml->User["thumb"]->__toString();
        }

        $this->_addPlatform($watched->platform);
    }

    public function _addPlatform($platfrom) {
        if (!in_array($platfrom, $this->platforms)) {
            $this->platforms[] = $platfrom;
        }
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    private $jsonFields = array(
        "id", "name", "platforms", "thumb"
    );

    private $id;
    private $name;
    private $platforms;
    private $thumb;
}
?>
