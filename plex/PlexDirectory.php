<?php

class PlexDirectory implements JsonSerializable {
    public function __construct($xml) {
        $this->type = "";
        if (isset($xml["type"])) {
            $this->type = $xml["type"]->__toString();
        }

        $this->title = "";
        if (isset($xml["title"])) {
            $this->title = $xml["title"]->__toString();
        }

        $this->parentTitle = "";
        if (isset($xml["parentTitle"])) {
            $this->parentTitle = $xml["parentTitle"]->__toString();
        }

        $this->thumb = "";
        if (isset($xml["thumb"])) {
            $this->thumb = $xml["thumb"]->__toString();
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
        "type", "title", "parentTitle", "thumb"
    ];
}

?>
