<?php
require_once(__DIR__ . "/PlexDirectory.php");
require_once(__DIR__ . "/PlexVideo.php");

class Plex {
    function __construct($remote, $local, $token) {
        $this->_remote = $remote;
        $this->_local = $local;
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
        $ret = $this->_get("/library/recentlyAdded");

        if (!$ret) {
            return [];
        }

        $recentlyAddedXml = new SimpleXmlElement($ret);

        $recentlyAdded = [];
        foreach ($recentlyAddedXml->children() as $type => $xml) {
            $recentlyAdded[] = $this->_mediaToObject($type, $xml);
        }

        return $recentlyAdded;
    }

    function image($url, $width, $height) {
        header("Content-type: image/jpeg");

        $url = $this->_local . $url;
        $str = sprintf("/photo/:/transcode?width=%d&height=%d&minSize=1&url=%s", $width, $height, urlencode($url));
        $image = $this->_get($str);
        if ($image) {
            echo $image;
        }
    }

    function _mediaToObject($type, $xml) {
        switch ($type) {
            case "Directory":
                return new PlexDirectory($xml);
            case "Video":
                return new PlexVideo($xml);
        }

        return new stdClass;
    }

    function metadata($usRatingKey) {
        $sRatingKey = 0 + $usRatingKey;

        $url = sprintf("/library/metadata/%d", $sRatingKey);
        $xml = simplexml_load_string($this->_get($url));


        if (!$xml) {
            return new stdClass;
        }

        foreach ($xml->children() as $type => $child) {
            return $this->_mediaToObject($type, $child);
        }
    }

    function children($usRatingKey) {
        $sRatingKey = 0 + $usRatingKey;

        $url = sprintf("/library/metadata/%d/children", $sRatingKey);
        $childrenXml = simplexml_load_string($this->_get($url));

        //print_r($childrenXml);

        $children = [];
        foreach ($childrenXml->children() as $type => $xml) {
            $children[] = $this->_mediaToObject($type, $xml);
        }

        return $children;
    }

    function _get($url) {
        $context = $this->_context();
        $host = $this->_remote . $url;

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

    private $_remote;
    private $_local;
    private $_token;
}

?>
