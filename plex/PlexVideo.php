<?php

class PlexVideo implements JsonSerializable {
    public function __construct($xml) {
        $this->type = "";
        if (isset($xml["type"])) {
            $this->type = $xml["type"]->__toString();
        }

        $this->title = "";
        if (isset($xml["title"])) {
            $this->title = $xml["title"]->__toString();
        }

        $this->thumb = "";
        if (isset($xml["thumb"])) {
            $this->thumb = $xml["thumb"]->__toString();
        }

        $this->year = "0";
        if (isset($xml["year"])) {
            $this->year = $xml["year"]->__toString();
        }

        $this->addedAt = "";
        if (isset($xml["addedAt"])) {
            $this->addedAt = $xml["addedAt"]->__toString() * 1000;
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
        "type", "title", "thumb", "year",
        "addedAt"
    ];
}

?>
