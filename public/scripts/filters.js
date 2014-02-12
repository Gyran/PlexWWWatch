angular.module("plex-wwwatch")
.filter("duration", function () {
    return function (input) {
        return moment.duration(input).humanize();
    };
})
;
