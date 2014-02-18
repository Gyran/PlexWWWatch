<?php

class PlexWatchWatched implements JsonSerializable {
    public function __construct($dbrow) {
        $this->id               = $dbrow["id"];
        $this->sessionId        = $dbrow["session_id"];
        $this->time             = $dbrow["time"] * 1000;
        $this->user             = $dbrow["user"];
        $this->device           = $dbrow["platform"];
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

        $this->_xml             = $dbrow["xml"];
    }

    public function __get($p) {
        $m = "get_" . $p;
        if (method_exists($this, $m)) {
            return $this->$m();
        }

        user_error("Undefined property ". $p);
    }

    public function jsonSerialize() {
        $ret = array();
        foreach ($this->jsonFields as $field) {
            $ret[$field] = $this->$field;
        }

        return $ret;
    }

    private function get_xml() {
        return $this->xml = new SimpleXmlElement($this->_xml);
    }

    private function get_type() {
        $type = "";
        if (isset($this->xml["type"])) {
            $type = $this->xml["type"]->__toString();
        }

        return $this->type = $type;
    }

    private function get_thumb() {
        $thumb = "";
        if ($this->type == "movie") {
            if (isset($this->xml["thumb"])) {
                $thumb = $this->xml["thumb"]->__toString();
            }
        } else if ($this->type == "episode") {
            if (isset($this->xml["parentThumb"])) {
                $thumb = $this->xml["parentThumb"]->__toString();
            } else if (isset($this->xml["grandparentThumb"])) {
                $thumb = $this->xml["grandparentThumb"]->__toString();
            } else if (isset($xml["thumb"])) {
                $thumb = $this->xml["thumb"]->__toString();
            }
        }
        return $this->thumb = $thumb;
    }

    private function get_duration() {
        $duration = 0;
        if (isset($this->xml["duration"])) {
            $duration = $this->xml["duration"]->__toString();
        }
        return $this->duration = $duration;
    }

    private function get_viewOffset() {
        $viewOffset = 0;
        if (isset($this->xml["viewOffset"])) {
            $viewOffset = $this->xml["viewOffset"]->__toString();
        }
        return $this->viewOffset = $viewOffset;
    }

    private function get_timeWatched() {
        $start = $this->time;
        $stop = 0;

        if ($this->stopped > 0) {
            $stop = $this->stopped;
        } else if ($this->paused > 0) {
            $stop = $this->paused;
        } else {
            $stop = time() * 1000;
        }

        return $this->timeWatched = $stop - $start - $this->pausedCounter;
    }

    private function get_progress() {
        $progress = ($this->viewOffset / $this->duration) * 100;
        if ($progress > 90) {
            $progress = 100;
        }
        return $this->progress = $progress;
    }

    private $jsonFields = array(
        "id", "time", "title", "origTitle",
        "origTitleEp", "user", "device",
        "episode", "season", "stopped", "paused",
        "pausedCounter", "ipAddress", "thumb",
        "duration", "episode", "season", "viewOffset",
        "type", "viewOffset", "timeWatched", "duration",
        "progress", "year"
    );

    public $id;
    public $sessionId;
    public $time;
    public $user;
    public $device;
    public $title;
    public $origTitle;
    public $origTitleEp;
    public $episode;
    public $season;
    public $year;
    public $rating;
    public $genre;
    public $summary;
    public $notified;
    public $stopped;
    public $paused;
    public $pausedCounter;
    public $ipAddress;

    private $_xml;
}

?>
