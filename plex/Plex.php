<?php

class Plex {
    function __construct($pms, $token) {
        $this->_pms = $pms;
        $this->_token = $token;
    }

    function validateToken() {

    }

    function _curl() {
        $ch = curl_init();
    }

    private $_pms;
    private $_token;
}

?>
