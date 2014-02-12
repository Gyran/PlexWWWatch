<?php
require_once("PlexWatchWatched.php");

class PlexWatchWatchedIterator implements Iterator {
    public function __construct($statement) {
        $this->_statement = $statement;
        $this->_statement->execute();
    }

    public function rewind() {
        // rewinding won't work
        $this->next();
        $this->_counter = 0;
    }

    public function current() {
        return $this->_current;
    }

    public function key() {
        return $this->_counter;
    }

    public function next() {
        $res = $this->_statement->fetch(PDO::FETCH_ASSOC);
        if ($res) {
            $this->_current = new PlexWatchWatched($res);
            $this->_counter += 1;
        } else {
            $this->_current = null;
        }
    }

    public function valid() {
        return $this->_current !== null;
    }

    private $_counter;
    private $_statement;
    private $_current;
}

?>
