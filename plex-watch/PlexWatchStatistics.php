<?php

class PlexWatchStatistics implements JsonSerializable {
    public function __construct() {
        $this->_init();
    }
    public function jsonSerialize() {
        return $this->_statistics;
    }

    public function addWatched($watched) {
        if ($watched->type !== "movie" &&
            $watched->type !== "episode") {
            return;
        }

        $this->_dayOfMonth($watched);
        $this->_hourOfDay($watched);
        $this->_dayOfWeek($watched);
        $this->_last30($watched);
        /*
        $this->_type($watched);
        $this->_item($watched);
        $this->_total($watched);
        */
    }

    private function _update($section, $index, $watched) {
        $this->_statistics["total"]["numWatches"][$section][$watched->type][$index][1] += 1;
        $this->_statistics["total"]["timeWatched"][$section][$watched->type][$index][1] += $watched->timeWatched;

        //$this->_statistics["numWatches"][$section]["total"][$index][1] += 1;
        //$this->_statistics["timeWatched"][$section]["total"][$index][1] += $watched->timeWatched;
    }

    private function _last30($watched) {
        if ($watched->dateTime < $this->_pastDT) {
            return;
        }
/*
        echo "mellan ", $this->_pastDT->format("Y-m-d"), " och ", $watched->dateTime->format("Y-m-d"), " är det [";
        echo $this->_pastDT->diff(new DateTime("today"))->d, "]<br>";

        $index = 0;
*/
        $index = 30 - $this->_pastDT->diff($watched->dateTime)->d;

        $this->_statistics["last30"]["numWatches"][$watched->type][$index][1] += 1;
        $this->_statistics["last30"]["timeWatched"][$watched->type][$index][1] += $watched->timeWatched;

    }

    private function _type($watched) {
        $this->_statistics["numWatches"]["type"][$watched->type] += 1;
        $this->_statistics["timeWatched"]["type"][$watched->type] += $watched->timeWatched;
    }

    private function _dayOfMonth($watched) {
        $dayOfMonthIndex = $watched->dateTime->format("j") - 1;
        $this->_update("dayOfMonth", $dayOfMonthIndex, $watched);
    }

    private function _dayOfWeek($watched) {
        $dayOfWeekIndex = $watched->dateTime->format("N") - 1;
        $this->_update("dayOfWeek", $dayOfWeekIndex, $watched);
    }

    private function _hourOfDay($watched) {
        $hourOfDayIndex = $watched->dateTime->format("G");
        $this->_update("hourOfDay", $hourOfDayIndex, $watched);
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
        $monthDays = [
            [ 1, 0],
            [ 2, 0],
            [ 3, 0],
            [ 4, 0],
            [ 5, 0],
            [ 6, 0],
            [ 7, 0],
            [ 8, 0],
            [ 9, 0],
            [10, 0],
            [11, 0],
            [12, 0],
            [13, 0],
            [14, 0],
            [15, 0],
            [16, 0],
            [17, 0],
            [18, 0],
            [19, 0],
            [20, 0],
            [21, 0],
            [22, 0],
            [23, 0],
            [24, 0],
            [25, 0],
            [26, 0],
            [27, 0],
            [28, 0],
            [29, 0],
            [30, 0],
            [31, 0]
        ];
        $weekDays = [
            ["Monday",    0],
            ["Tuesday",   0],
            ["Wednesday", 0],
            ["Thursday",  0],
            ["Friday",    0],
            ["Saturday",  0],
            ["Sunday",    0]
        ];
        $dayHours = [
            [ 0, 0],
            [ 1, 0],
            [ 2, 0],
            [ 3, 0],
            [ 4, 0],
            [ 5, 0],
            [ 6, 0],
            [ 7, 0],
            [ 8, 0],
            [ 9, 0],
            [10, 0],
            [11, 0],
            [12, 0],
            [13, 0],
            [14, 0],
            [15, 0],
            [16, 0],
            [17, 0],
            [18, 0],
            [19, 0],
            [20, 0],
            [21, 0],
            [22, 0],
            [23, 0]
        ];


        $template = [
            "dayOfMonth" => [
                "movie" => $monthDays,
                "episode" => $monthDays
            ],
            "dayOfWeek" => [
                "movie" => $weekDays,
                "episode" => $weekDays
            ],
            "hourOfDay" => [
                "movie" => $dayHours,
                "episode" => $dayHours
            ]
        ];

        $last30Template = [
            "movie" => [],
            "episode" => []
        ];

        $this->_statistics["total"]["numWatches"]   = $template;
        $this->_statistics["total"]["timeWatched"]  = $template;
        $this->_statistics["last30"]["numWatches"]  = $last30Template;
        $this->_statistics["last30"]["timeWatched"] = $last30Template;

        $dt = new dateTime("today");
        for ($i = 0; $i <= 30; ++$i) {
            $day = $dt->format("U") * 1;
            $this->_statistics["last30"]["numWatches"]["movie"][]  = [$day, 0];
            $this->_statistics["last30"]["numWatches"]["episode"][]  = [$day, 0];
            $this->_statistics["last30"]["timeWatched"]["movie"][] = [$day, 0];
            $this->_statistics["last30"]["timeWatched"]["episode"][] = [$day, 0];
            $dt->sub(new DateInterval("P1D"));
        }

        $this->_pastDT = $dt;
    }

    private $_pastDT;
    private $_statistics;
}

?>
