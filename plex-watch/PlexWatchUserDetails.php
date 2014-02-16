<?php
require_once("PlexWatchUser.php");

class PlexWatchUserDetails extends PlexWatchUser {
    public function __construct($username) {
        parent::__construct($username);

        $this->watched = array();
        $this->intervalWatched = [
            "0thisDay" => ["title" => "Today", "watches"=>0, "timeWatched"=>0],
            "1prevDay" => ["title" => "Yesterday", "watches"=>0, "timeWatched"=>0],
            "2thisWeek" => ["title" => "This week", "watches"=>0, "timeWatched"=>0],
            "3prevWeek" => ["title" => "Previous week", "watches"=>0, "timeWatched"=>0],
            "4thisMonth" => ["title" => "This month", "watches"=>0, "timeWatched"=>0],
            "5prevMonth" => ["title" => "Previous month", "watches"=>0, "timeWatched"=>0],
            "6thisYear" => ["title" => "This Year", "watches"=>0, "timeWatched"=>0],
            "7prevYear" => ["title" => "Previous Year", "watches"=>0, "timeWatched"=>0]
        ];

        $this->jsonFields[] = "watched";
        $this->jsonFields[] = "intervalWatched";
    }

    public function addWatched($watched) {
        parent::addWatched($watched);

        $this->watched[] = $watched;
    }

    protected function _addType($watched) {
        $typeName = $watched->type;

        if (!isset($this->types[$typeName])) {
            $type = [
                "watches" => 0,
                "timeWatched" => 0
            ];
            $this->types[$typeName] = $type;
        }

        $this->types[$typeName]["watches"] += 1;
        $this->types[$typeName]["timeWatched"] += $watched->timeWatched;
    }

    protected function _addDevice($watched) {
        $deviceName = $watched->device;
        if (!isset($this->devices[$deviceName])) {
            $device = [
                "watches" => 0,
                "platform" => "",
                "timeWatched" => 0
            ];

            if (isset($watched->xml->Player["platform"])) {
                $device["platform"] = $watched->xml->Player["platform"]->__toString();
            }

            $this->devices[$deviceName] = $device;

        }
        $this->devices[$deviceName]["watches"] += 1;
        $this->devices[$deviceName]["timeWatched"] += $watched->timeWatched;
    }

    protected function _addTimeWatched($watched) {
        parent::_addTimeWatched($watched);

        $ts = new DateTime();
        $ts->setTimestamp($watched->time / 1000);

        $thisDay = new DateTime("today");
        $prevDay = clone $thisDay;
        $prevDay->sub(new DateInterval("P1D"));

        // TODO have first day of week as sunday
        $thisWeek = new DateTime("next Monday -1 week");
        $prevWeek = clone $thisWeek;
        $prevWeek->sub(new DateInterval("P1W"));

        $thisMonth = new DateTime("00:00 first day of this month");
        $prevMonth = clone $thisMonth;
        $prevMonth->sub(new DateInterval("P1M"));

        $thisYear = new DateTime("first day of January");
        $prevYear = clone $thisYear;
        $prevYear->sub(new DateInterval("P1Y"));

        if ($ts > $thisDay) {
            $this->intervalWatched["0thisDay"]["watches"] += 1;
            $this->intervalWatched["0thisDay"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $prevDay) {
            $this->intervalWatched["1prevDay"]["watches"] += 1;
            $this->intervalWatched["1prevDay"]["timeWatched"] += $watched->timeWatched;
        }

        if ($ts > $thisWeek) {
            $this->intervalWatched["2thisWeek"]["watches"] += 1;
            $this->intervalWatched["2thisWeek"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $prevWeek) {
            $this->intervalWatched["3prevWeek"]["watches"] += 1;
            $this->intervalWatched["3prevWeek"]["timeWatched"] += $watched->timeWatched;
        }

        if ($ts > $thisMonth) {
            $this->intervalWatched["4thisMonth"]["watches"] += 1;
            $this->intervalWatched["4thisMonth"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $prevMonth) {
            $this->intervalWatched["5prevMonth"]["watches"] += 1;
            $this->intervalWatched["5prevMonth"]["timeWatched"] += $watched->timeWatched;
        }

        if ($ts > $thisYear) {
            $this->intervalWatched["6thisYear"]["watches"] += 1;
            $this->intervalWatched["6thisYear"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $prevYear) {
            $this->intervalWatched["7prevYear"]["watches"] += 1;
            $this->intervalWatched["7prevYear"]["timeWatched"] += $watched->timeWatched;
        }
    }

    public $watched;
    public $intervalWatched;
}

?>
