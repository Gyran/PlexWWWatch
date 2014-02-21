<?php
require_once("PlexWatchUser.php");

class PlexWatchUserDetails extends PlexWatchUser {
    public function __construct($username, $plexWatch = null) {
        parent::__construct($username, $plexWatch);

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

        // vars for calculation
        $this->_thisDay = new DateTime("today");
        $this->_prevDay = clone $this->_thisDay;
        $this->_prevDay->sub(new DateInterval("P1D"));

        // TODO have first day of week as sunday
        $this->_thisWeek = new DateTime("next Monday -1 week");
        $this->_prevWeek = clone $this->_thisWeek;
        $this->_prevWeek->sub(new DateInterval("P1W"));

        $this->_thisMonth = new DateTime("00:00 first day of this month");
        $this->_prevMonth = clone $this->_thisMonth;
        $this->_prevMonth->sub(new DateInterval("P1M"));

        $this->_thisYear = new DateTime("first day of January");
        $this->_prevYear = clone $this->_thisYear;
        $this->_prevYear->sub(new DateInterval("P1Y"));
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
                $platform = $watched->xml->Player["platform"]->__toString();
                if ($platform === "" &&
                    preg_match("/^TV\s[A-Z][A-Z]?\d\d[A-Z][A-Z]?\d{3}/", $deviceName) === 1) {
                    $platform = "Samsung";
                }

                $device["platform"] = $platform;
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

        if ($ts > $this->_thisDay) {
            $this->intervalWatched["0thisDay"]["watches"] += 1;
            $this->intervalWatched["0thisDay"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $this->_prevDay) {
            $this->intervalWatched["1prevDay"]["watches"] += 1;
            $this->intervalWatched["1prevDay"]["timeWatched"] += $watched->timeWatched;
        }

        if ($ts > $this->_thisWeek) {
            $this->intervalWatched["2thisWeek"]["watches"] += 1;
            $this->intervalWatched["2thisWeek"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $this->_prevWeek) {
            $this->intervalWatched["3prevWeek"]["watches"] += 1;
            $this->intervalWatched["3prevWeek"]["timeWatched"] += $watched->timeWatched;
        }

        if ($ts > $this->_thisMonth) {
            $this->intervalWatched["4thisMonth"]["watches"] += 1;
            $this->intervalWatched["4thisMonth"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $this->_prevMonth) {
            $this->intervalWatched["5prevMonth"]["watches"] += 1;
            $this->intervalWatched["5prevMonth"]["timeWatched"] += $watched->timeWatched;
        }

        if ($ts > $this->_thisYear) {
            $this->intervalWatched["6thisYear"]["watches"] += 1;
            $this->intervalWatched["6thisYear"]["timeWatched"] += $watched->timeWatched;
        } else if ($ts > $this->_prevYear) {
            $this->intervalWatched["7prevYear"]["watches"] += 1;
            $this->intervalWatched["7prevYear"]["timeWatched"] += $watched->timeWatched;
        }
    }

    public $watched;
    public $intervalWatched;
}

?>
