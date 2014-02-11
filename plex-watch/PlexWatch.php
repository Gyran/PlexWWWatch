<?php
require_once("PlexWatchWatched.php");
require_once("PlexWatchWatchedIterator.php");
require_once("PlexWatchUser.php");

class PlexWatch {
    function __construct($dbpath, $grouped = false) {
        $this->_dbh = new SQLite3($dbpath);

        $this->_grouped = $grouped;
    }

    public function watched() {
        return iterator_to_array($this->_watchedIterator());
    }

    public function users() {
        $it = $this->_watchedIterator();

        foreach ($it as $watched) {
            $username = $watched->user;
            if (!isset($users[$username])) {
                $users[$username] = new PlexWatchUser($username);
            }
            $users[$username]->addWatched($watched);
        }

        return $users;
    }

    private function _watchedIterator() {
        $statement = $this->_dbh->prepare("SELECT * FROM " . $this->_getWatchedTable() . " ORDER BY time DESC");
        $result = $statement->execute();

        return new PlexWatchWatchedIterator($result);
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
