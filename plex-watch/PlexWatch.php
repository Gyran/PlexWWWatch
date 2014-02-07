<?php
require_once("PlexWatchWatched.php");

class PlexWatch {
    function __construct($dbpath, $grouped = false) {
        $this->_dbh = new SQLite3($dbpath);

        $this->_grouped = $grouped;
    }

    public function query() {
        $statement = $this->_dbh->prepare("SELECT * FROM " . $this->_getWatchedTable() . " ORDER BY time DESC");
        $result = $statement->execute();

        $watched = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)) {
            $watched[] = new PlexWatchWatched($res);
        }

        return $watched;
    }

    private function _getWatchedTable () {
        if ($this->_grouped) {
            return "grouped";
        }
        return "processed";
    }

    private $_dbh;
    private $_grouped;
}


?>
