<?php

class PlexWatchWatched implements JsonSerializable {
    public function __construct($dbrow, $plexWatch = null) {
        $this->id               = $dbrow["id"];
        $this->sessionId        = $dbrow["session_id"];
        $this->time             = $dbrow["time"] * 1000;
        $this->user             = $dbrow["user"];
        $this->userDisplay      = $this->user;
        $this->device           = $dbrow["platform"];
        $this->title            = $dbrow["title"];
        $this->origTitle        = $dbrow["orig_title"];
        $this->origTitleEp      = $dbrow["orig_title_ep"];
        $this->episode          = $dbrow["episode"];
        $this->season           = $dbrow["season"];
        $this->year             = $dbrow["year"];
        $this->rating           = $dbrow["rating"];
        //$this->genre            = $dbrow["genre"];
        $this->summary          = $dbrow["summary"];
        $this->notified         = $dbrow["notified"];
        $this->stopped          = $dbrow["stopped"] * 1000;
        $this->paused           = $dbrow["paused"] * 1000;
        $this->pausedCounter    = $dbrow["paused_counter"] * 1000;
        $this->ipAddress        = $dbrow["ip_address"];

        $this->_xml             = $dbrow["xml"];

        if (isset($plexWatch)) {
            $this->userDisplay = $plexWatch->userDisplayName($this->user, $this->device);
        }
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
        if (isset($this->xml["thumb"])) {
            $thumb = $this->xml["thumb"]->__toString();
        }
        return $this->thumb = $thumb;
    }

    private function get_parentThumb() {
        $parentThumb = "";
        if (isset($this->xml["parentThumb"])) {
            $parentThumb = $this->xml["parentThumb"]->__toString();
        }
        return $this->parentThumb = $parentThumb;
    }

    private function get_grandParentThumb() {
        $grandParentThumb = "";
        if (isset($this->xml["grandParentThumb"])) {
            $grandParentThumb = $this->xml["grandParentThumb"]->__toString();
        }
        return $this->grandParentThumb = $grandParentThumb;
    }

    private function get_duration() {
        $duration = 0;
        if (isset($this->xml["duration"])) {
            $duration = $this->xml["duration"]->__toString();
        }
        return $this->duration = $duration * 1;
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

    private function get_dateTime() {
        $this->dateTime = new DateTime();
        $this->dateTime->setTimestamp($this->time / 1000);
        return $this->dateTime;
    }

    private function get_art() {
        $art = "";
        if (isset($this->xml["art"])) {
            $art = $this->xml["art"]->__toString();
        }
        return $this->art = $art;
    }

    private function get_addedAt() {
        $addedAt = "";
        if (isset($this->xml["addedAt"])) {
            $addedAt = $this->xml["addedAt"]->__toString() * 1000;
        }
        return $this->addedAt = $addedAt;
    }

    private function get_directors() {

    }

    private function get_genres() {

    }

    private function get_roles() {

    }

    private function get_writers() {

    }

    private function get_producer() {

    }

    private function get_conuntry() {

    }

    private function get_metaid() {
        $metaid = 0;
        if (preg_match("/metadata\/(\d+)\_/", $this->sessionId, $matches)) {
            $metaid = $matches[1];
        }
        return $this->metaid = $metaid;
    }

    private $jsonFields = array(
        "id", "time", "title", "origTitle",
        "origTitleEp", "user", "device",
        "episode", "season", "stopped", "paused",
        "pausedCounter", "ipAddress", "thumb",
        "duration", "episode", "season", "viewOffset",
        "type", "viewOffset", "timeWatched", "duration",
        "progress", "year", "userDisplay", "parentThumb",
        "metaid"
    );

    public $id;
    public $sessionId;
    public $time;
    public $user;
    public $userDisplay;
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
