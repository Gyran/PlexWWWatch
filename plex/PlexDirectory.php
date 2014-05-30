<?php
require_once(__DIR__ . "/PlexXMLObject.php");

class PlexDirectory extends PlexXMLObject implements JsonSerializable {
    public function __construct($xml) {
        $this->setNotSetted("ratingKey", $xml);
        $this->setNotSetted("type", $xml);
        $this->setNotSetted("title", $xml);
        $this->setNotSetted("parentTitle", $xml);
        $this->setNotSetted("parentRatingKey", $xml);
        $this->setNotSetted("thumb", $xml);
        $this->setNotSetted("summary", $xml);
        $this->setNotSetted("duration", $xml);
        $this->duration = 0 + $this->duration;
        $this->setNotSetted("addedAt", $xml);
        $this->addedAt = $this->addedAt * 1000;
        $this->genre = [];

        foreach ($xml->Genre as $genre) {
            $this->genre[] = $genre["tag"]->__toString();;
        }
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    private $jsonFields = [
        "type", "title", "parentTitle", "thumb",
        "addedAt", "ratingKey", "summary", "duration",
        "genre", "parentRatingKey"
    ];
}

?>
