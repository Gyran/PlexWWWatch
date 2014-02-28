<?php
require_once(__DIR__ . "/PlexXMLObject.php");

class PlexVideo extends PlexXMLObject implements JsonSerializable {
    public function __construct($xml) {
        $this->setNotSetted("ratingKey", $xml, 0);
        $this->setNotSetted("parentRatingKey", $xml, 0);
        $this->setNotSetted("grandparentRratingKey", $xml, 0);
        $this->setNotSetted("grandparentTitle", $xml);
        $this->setNotSetted("contentRating", $xml);
        $this->setNotSetted("index", $xml);
        $this->setNotSetted("parentIndex", $xml);
        $this->setNotSetted("originallyAvailableAt", $xml);
        $this->setNotSetted("type", $xml);
        $this->setNotSetted("title", $xml);
        $this->setNotSetted("thumb", $xml);
        $this->setNotSetted("parentThumb", $xml);
        $this->setNotSetted("grandparentThumb", $xml);
        $this->setNotSetted("art", $xml);
        $this->setNotSetted("studio", $xml);
        $this->setNotSetted("summary", $xml);
        $this->setNotSetted("rating", $xml);
        $this->setNotSetted("viewCount", $xml);
        $this->setNotSetted("year", $xml);
        $this->setNotSetted("tagline", $xml);
        $this->setNotSetted("addedAt", $xml, 0);
        $this->addedAt = $this->addedAt * 1000;
        $this->setNotSetted("duration", $xml, 0);
        $this->duration = 0 + $this->duration;
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    private $jsonFields = [
        "contentRating", "index", "parentIndex", "thumb",
        "grandparentTitle", "parentThumb", "grandparentThumb",
        "originallyAvailableAt", "type", "art", "studio",
        "title", "summary", "rating", "year", "tagline", "duration",
        "addedAt", "ratingKey"
    ];
}

?>
