angular.module("plex-wwwatch")
.filter("duration", function () {
    return function (input) {
        if (input === 0) {
            return "nothing";
        }
        return moment.duration(input).humanize();
    };
})
.filter("exactDuration", function () {
    return function (input) {
        if (input === 0) {
            return "nothing";
        }
        var d = moment.duration(input);
        ret = "";

        if (d.hours() > 0) {
            ret = ret + d.hours() + " hr ";
        }
        if (d.minutes() > 0) {
            ret = ret + d.minutes() + " min ";
        }
        return ret;

    };
})
.filter("ucFirst", function () {
    return function (input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
})
.filter("ddigit", function () {
    return function (input) {
        if (input < 10) {
            return "0" + input;
        }
        return input;
    };
})
;
