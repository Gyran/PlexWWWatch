<?php

class PlexWatchWatched implements JsonSerializable {
    public function __construct($dbrow) {
        $this->id               = $dbrow["id"];
        $this->sessionId        = $dbrow["session_id"];
        $this->time             = $dbrow["time"] * 1000;
        $this->user             = $dbrow["user"];
        $this->platform         = $dbrow["platform"];
        $this->title            = $dbrow["title"];
        $this->origTitle        = $dbrow["orig_title"];
        $this->origTitleEp      = $dbrow["orig_title_ep"];
        $this->episode          = $dbrow["episode"];
        $this->season           = $dbrow["season"];
        $this->year             = $dbrow["year"];
        $this->rating           = $dbrow["rating"];
        $this->genre            = $dbrow["genre"];
        $this->summary          = $dbrow["summary"];
        $this->notified         = $dbrow["notified"];
        $this->stopped          = $dbrow["stopped"] * 1000;
        $this->paused           = $dbrow["paused"] * 1000;
        $this->pausedCounter    = $dbrow["paused_counter"] * 1000;
        $this->ipAddress        = $dbrow["ip_address"];

        $xml = new SimpleXmlElement($dbrow["xml"]);

        $this->type = "";
        if (isset($xml["type"])) {
            $this->type = $xml["type"]->__toString();
        }

        $this->thumb = "";
        if ($this->type == "movie") {
            if (isset($xml["thumb"])) {
                $this->thumb = $xml["thumb"]->__toString();
            }
        } else if ($this->type == "episode") {
            if (isset($xml["parentThumb"])) {
                $this->thumb = $xml["parentThumb"]->__toString();
            } else if (isset($xml["grandparentThumb"])) {
                $this->thumb = $xml["grandparentThumb"]->__toString();
            } else if (isset($xml["thumb"])) {
                $this->thumb = $xml["thumb"]->__toString();
            }
        }
        $this->duration = 0;
        if (isset($xml["duration"])) {
            $this->duration = $xml["duration"]->__toString();
        }

        $this->viewOffset = 0;
        if (isset($xml["viewOffset"])) {
            $this->viewOffset = $xml["viewOffset"]->__toString();
        }

    }

    public function __get($var) {
        return $this->$var;
    }

    public function jsonSerialize() {

        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    private $jsonFields = array(
        "id", "time", "title", "origTitle",
        "origTitleEp", "user", "platform",
        "episode", "season", "stopped", "paused",
        "pausedCounter", "ipAddress", "thumb",
        "duration", "episode", "season", "viewOffset",
        "type"
    );

    private $id;
    private $session_id;
    private $time;
    private $user;
    private $platform;
    private $title;
    private $orig_title;
    private $orig_title_ep;
    private $episode;
    private $season;
    private $year;
    private $rating;
    private $genre;
    private $summary;
    private $notified;
    private $stopped;
    private $paused;
    private $paused_counter;
    private $xml;
    private $ip_address;
}

?>
