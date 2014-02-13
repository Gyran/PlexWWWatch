<?php
require_once("PlexWatchWatched.php");
require_once("PlexWatchWatchedIterator.php");
require_once("PlexWatchUser.php");
require_once("PlexWatchUserDetails.php");

class PlexWatch {
    function __construct($dbpath, $grouped = false) {
        $dsn =  "sqlite:" . $dbpath;
        $this->_dbh = new PDO($dsn);

        $this->_grouped = $grouped;
    }

    public function watched() {
        return iterator_to_array($this->_watchedIterator(), false);
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

        return array_values($users);
    }

    public function user($username) {
        $config = [];
        $config["user"] = $username;

        $user = new PlexWatchUserDetails($username);

        $it = $this->_watchedIterator($config);
        foreach ($it as $watched) {
            $user->addWatched($watched);
        }

        return $user;
    }

    private function _watchedIterator($config = []) {
        $bind = [];
        $where = [];

        $sql = "SELECT * FROM " . $this->_getWatchedTable();
        if (isset($config["user"])) {
            $where[] = ["user", ":user"];
            $bind[] = [":user", $config["user"], PDO::PARAM_STR];
        }

        if (!empty($where)) {
            $sql .= " WHERE ";
            foreach ($where as $w) {
                $sql .= " " . $w[0] . "=" . $w[1] . " ";
            }
        }

        $sql .= " ORDER BY id DESC";

        $statement = $this->_dbh->prepare($sql);

        foreach ($bind as $b) {
            $statement->bindValue($b[0], $b[1], $b[2]);
        }

        return new PlexWatchWatchedIterator($statement);
    }

    private function _watchedIteratorFromStatement($statement) {

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
