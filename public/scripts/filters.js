angular.module("plex-wwwatch")
.filter("duration", function () {
    return function (input) {
        if (input === 0) {
            return "nothing";
        }
        return moment.duration(input).humanize();
    };
})
.filter("ucFirst", function () {
    return function (input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
})
;
