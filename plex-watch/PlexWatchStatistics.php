<?php

class PlexWatchStatistics implements JsonSerializable {
    public function __construct() {
        $this->_init();
    }
    public function jsonSerialize() {
        return $this->_statistics;
    }

    public function addWatched($watched) {
        $this->_type($watched);
        $this->_dayOfMonth($watched);
        $this->_dayOfWeek($watched);
        $this->_hourOfDay($watched);
        $this->_item($watched);
        $this->_total($watched);
    }

    private function _total($watched) {
        $this->_statistics["numWatches"]["type"]["total"] += 1;
        $this->_statistics["timeWatched"]["type"]["total"] += $watched->timeWatched;
    }

    private function _type($watched) {
        $this->_statistics["numWatches"]["type"][$watched->type] += 1;
        $this->_statistics["timeWatched"]["type"][$watched->type] += $watched->timeWatched;
    }

    private function _dayOfMonth($watched) {
        $dayOfMonth = $watched->dateTime->format("j");
        $this->_statistics["numWatches"]["dayOfMonth"][$dayOfMonth] += 1;
        $this->_statistics["timeWatched"]["dayOfMonth"][$dayOfMonth] += $watched->timeWatched;
    }

    private function _dayOfWeek($watched) {
        $dayOfWeek = $watched->dateTime->format("N");
        $this->_statistics["numWatches"]["dayOfWeek"][$dayOfWeek] += 1;
        $this->_statistics["timeWatched"]["dayOfWeek"][$dayOfWeek] += $watched->timeWatched;
    }

    private function _hourOfDay($watched) {
        $hourOfDay = $watched->dateTime->format("G");
        $this->_statistics["numWatches"]["hourOfDay"][$hourOfDay] += 1;
        $this->_statistics["timeWatched"]["hourOfDay"][$hourOfDay] += $watched->timeWatched;
    }

    private function _item($watched) {
        //echo "<pre>";
        $m = "_item_" . $watched->type;
        if (method_exists($this, $m)) {
            return $this->$m($watched);
        }
    }

    private function _item_movie($watched) {
        //print_r($watched);
        if (!isset($this->_statistics["numWatches"]["item"]["movie"][$watched->origTitle])) {
            $this->_statistics["numWatches"]["item"]["movie"][$watched->origTitle] = 0;
            $this->_statistics["timeWatched"]["item"]["movie"][$watched->origTitle] = 0;
        }
        $this->_statistics["numWatches"]["item"]["movie"][$watched->origTitle] += 1;
        $this->_statistics["timeWatched"]["item"]["movie"][$watched->origTitle] += $watched->timeWatched;
    }

    private function _item_episode($watched) {
        if (!isset($this->_statistics["numWatches"]["item"]["episode"][$watched->title])) {
            $this->_statistics["numWatches"]["item"]["episode"][$watched->title] = 0;
            $this->_statistics["timeWatched"]["item"]["episode"][$watched->title] = 0;
        }
        $this->_statistics["numWatches"]["item"]["episode"][$watched->title] += 1;
        $this->_statistics["timeWatched"]["item"]["episode"][$watched->title] += $watched->timeWatched;

        if (!isset($this->_statistics["numWatches"]["item"]["series"][$watched->origTitle])) {
            $this->_statistics["numWatches"]["item"]["series"][$watched->origTitle] = 0;
            $this->_statistics["timeWatched"]["item"]["series"][$watched->origTitle] = 0;
        }
        $this->_statistics["numWatches"]["item"]["series"][$watched->origTitle] += 1;
        $this->_statistics["timeWatched"]["item"]["series"][$watched->origTitle] += $watched->timeWatched;
    }

    private function _init() {
        $this->_statistics["numWatches"] = $this->_template;
        $this->_statistics["timeWatched"] = $this->_template;
    }

    private $_template = [
        "type" => [
            "movie" => 0,
            "episode" => 0,
            "total" => 0
        ],
        "dayOfMonth" => [
            1  => 0,
            2  => 0,
            3  => 0,
            4  => 0,
            5  => 0,
            6  => 0,
            7  => 0,
            8  => 0,
            9  => 0,
            10 => 0,
            11 => 0,
            12 => 0,
            13 => 0,
            14 => 0,
            15 => 0,
            16 => 0,
            17 => 0,
            18 => 0,
            19 => 0,
            20 => 0,
            21 => 0,
            22 => 0,
            23 => 0,
            24 => 0,
            25 => 0,
            26 => 0,
            27 => 0,
            28 => 0,
            29 => 0,
            30 => 0,
            31 => 0
        ],
        "dayOfWeek" => [
            1 => 0,
            2 => 0,
            3 => 0,
            4 => 0,
            5 => 0,
            6 => 0,
            7 => 0,
        ],
        "hourOfDay" => [
            0  => 0,
            1  => 0,
            2  => 0,
            3  => 0,
            4  => 0,
            5  => 0,
            6  => 0,
            7  => 0,
            8  => 0,
            9  => 0,
            10 => 0,
            11 => 0,
            12 => 0,
            13 => 0,
            14 => 0,
            15 => 0,
            16 => 0,
            17 => 0,
            18 => 0,
            19 => 0,
            20 => 0,
            21 => 0,
            22 => 0,
            23 => 0
        ],
        "item" => [
            "movie" => [],
            "series" => [],
            "episode" => []
        ]
    ];

    private $_statistics;
}

?>
