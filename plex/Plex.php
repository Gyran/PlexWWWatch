<?php
require_once("PlexDirectory.php");
require_once("PlexVideo.php");

class Plex {
    function __construct($remotepms, $localpms, $token) {
        $this->_remotepms = $remotepms;
        $this->_localpms = $localpms;
        $this->_token = $token;
    }

    function validateAccess() {
        $context = $this->_context();
        $host = $this->_remotepms;

        $ret = $this->_get("");
        if ($ret) {
            return true;
        }
        return false;
    }

    function recentlyAdded() {
        $context = $this->_context();

        $ret = $this->_get("/library/recentlyAdded");
        if (!$ret) {
            return [];
        }

        $recentlyAddedXml = new SimpleXmlElement($ret);

        $recentlyAdded = [];
        foreach ($recentlyAddedXml->children() as $type => $xml) {
            switch ($type) {
                case "Directory":
                    $recentlyAdded[] = new PlexDirectory($xml);
                    break;
                case "Video":
                    $recentlyAdded[] = new PlexVideo($xml);
                default:
                    break;
            }
        }

        return $recentlyAdded;
    }

    function thumb($thumb) {
        header("Content-type: image/jpeg");
        $url = $this->_localpms . $thumb;
        $image = $this->_get("/photo/:/transcode?width=150&height=225&minSize=1&url=" . $url);
        if ($image) {
            echo $image;
        } else {
            //echo file_get_contents(__DIR__ . "/../public/img/poster.png");
        }
    }

    function _get($url) {
        $context = $this->_context();
        $host = $this->_remotepms . $url;

        return @file_get_contents($host, false, $context);
    }

    function _context() {
        $headers =  "X-Plex-Client-Identifier: PlexWWWatch Client\r\n" .
                    "X-Plex-Product: PlexWWWatch\r\n" .
                    "X-Plex-Version: 0.1\r\n";

        if ($this->_token) {
            $headers .= "X-Plex-Token: " . $this->_token . "\r\n";
        }

        $opts = [
            "http" => [
                "method" => "GET",
                "header" => $headers
            ]
        ];
        return stream_context_create($opts);
    }

    private $_remotepms;
    private $_localpms;
    private $_token;
}

?>
