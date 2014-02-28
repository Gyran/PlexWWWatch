<?php

class PlexXMLObject {
    protected function setNotSetted($property, $xml, $default = "") {
       $this->$property = $default;
        if (isset($xml[$property])) {
            $this->$property = $xml[$property]->__toString();
       }
    }
}

?>
