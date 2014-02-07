<?php
require_once("PlexWatchWatched.php");

class PlexWatch {
    function __construct($dbpath, $grouped = false) {
        $this->dbh = new SQLite3($dbpath);

        $this->grouped = $grouped;
    }

    public function query() {
        $statement = $this->dbh->prepare("SELECT * FROM " . $this->getWatchedTable() . " ORDER BY time DESC LIMIT 50");
        $result = $statement->execute();

        $watched = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)) {
            $watched[] = new PlexWatchWatched($res);
        }

        return $watched;
    }

    public function getLatestWatched($limit = 10, $users = null) {
        $statement = $this->dbh->prepare("SELECT * FROM " . $this->getWatchedTable() . " ORDER BY id DESC LIMIT :limit");
        $statement->bindValue(":limit", $limit, SQLITE3_INTEGER);

        $result = $statement->execute();
        $watched = array();
        while($res = $result->fetchArray(SQLITE3_ASSOC)) {
            $watched[] = new PlexWatchWatched($res);
        }

        return $watched;
    }

    private function getWatchedTable () {
        if ($this->grouped) {
            return "grouped";
        }
        return "processed";
    }

    private $dbh;
    private $grouped;
}


?>
