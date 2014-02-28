angular.module("ngPlexWatch",
    [
        "ngResource"
    ])
.factory("PlexWatch", ["$resource", function ($resource) {
    return {
        "Users": $resource("backend/users.php"),
        "Watched": $resource("backend/watched.php"),
        "Item": $resource("backend/plexWatchItem.php")
    };
}]);

angular.module("plex",
    [
        "base64",
        "LocalStorageModule"
    ])
.factory("Plex", ["$resource", function ($resource) {
    return {
        "Item": $resource("backend/plexItem.php"),
        "Children": $resource("backend/plexChildren.php")
    };
}])
.service("myPlex", function ($http, $base64, $q, localStorageService) {
    var user = null;
    var pmsHost = "";

    this.init = function (pms) {
        user = localStorageService.get("myPlexUser");
        pmsHost = pms;
    };

    this.signin = function (username, password, remember) {
        var deferred = $q.defer();
        _signin(username, password).then(function (plexUser) {
            user = plexUser;
            if (remember) {
                localStorageService.add("myPlexUser", user);
            }
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    this.token = function (username, password) {
        var deferred = $q.defer();

        _signin(username, password).then(function (user) {
            deferred.resolve(user.authentication_token);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    this.recentlyAdded = function (pmshost) {
        if (!user) {
            return null;
        }

        var deferred = $q.defer();

        var headers = {
            "X-Plex-Client-Identifier": "PlexWWWatch Client",
            "X-Plex-Product": "PlexWWWatch",
            "X-Plex-Version": "0.1"
        };

        $http.get(pmsHost + "/library/recentlyAdded.json", {
            headers: headers
        }).success(function (data) {
            console.log(data);
        }).error(function (error) {
            console.log(error);
        });

        return deferred.promise;
    };

    var _basicAuthorization = function (username, password) {
        var hash = $base64.encode(username + ":" + password);
        return "Basic " + hash;
    };

    var _signin = function (username, password) {
        var url = "https://my.plexapp.com/users/sign_in.json";
        var auth = _basicAuthorization(username, password);

        var deferred = $q.defer();

        $http.post(url, null, {
            headers: {
                "Authorization": auth,
                "X-Plex-Client-Identifier": "PlexWWWatch Client",
                "X-Plex-Product": "PlexWWWatch",
                "X-Plex-Version": "0.1"
            }
        }).success(function (data) {
            deferred.resolve(data.user);
        }).error(function (error) {
            deferred.reject(error.error);
        });

        return deferred.promise;
    };
})
;

function PlexCtrl ($scope, $rootScope, localStorageService, myPlex) {
    $scope.username = "";
    $scope.password = "";
    $scope.remember = true;
    $scope.error = false;

    $scope.signin = function () {
        $scope.error = false;
        myPlex.signin($scope.username, $scope.password, $scope.remember).then(function () {
            console.log("wiie");
        }, function (error) {
            $scope.error = error;
        });

        /*
        myPlex.token($scope.username, $scope.password).then(function (token) {
            $rootScope.plex.token = token;

            if ($scope.remember) {
                localStorageService.add("plexToken", token);
            }

        }, function (error) {
            $scope.error = error;
        });
        */

        $scope.password = "";
    };

    $scope.signout = function () {
        $scope.error = false;
        $scope.plex.token = "";

        // delete remember
        localStorageService.remove("plexToken");
    };

}

angular.module("plex-wwwatch",
    [
        "ngRoute",
        "ngResource",
        "angularMoment",
        "ngTable",
        "PlexWWWatchPartials",
        "base64",
        "plex",
        "LocalStorageModule",
        "ngPlexWatch",
        "nvd3ChartDirectives"
    ])
.service("PWWWService", function ($http, $q, $resource) {
    this.check = function () {
        var deferred = $q.defer();
        $http.get("backend/check.php").success(function (data) {
            if (data.length <= 0) {
                deferred.resolve();
            } else {
                deferred.reject(data);
            }
        });

        return deferred.promise;
    };

    this.recentlyAdded = $resource("backend/recentlyAdded.php");

    this.settings = {
        all: function () {
            var deferred = $q.defer();
            $http.get("backend/settings.php?all").success(function (data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        save: function (settings) {
            var deferred = $q.defer();
            $http.post("backend/settings.php", settings).success(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }
    };

    this.statistics = $resource("backend/statistics.php");

    this.getSettings = function () {
        var deferred = $q.defer();
        $http.get("backend/settings.php").success(function (data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };

    this.saveSettings = function (settings) {
        var deferred = $q.defer();
        $http.post("backend/settings.php", settings).success(function (data) {
            if (data.error.length > 0) {
                deferred.reject(data.error);
            } else {
                deferred.resolve(data.settings);
            }
        });

        return deferred.promise;
    };
})
.factory("plexWWWatchConstants", function () {
    return {
        deviceIcons: {
            "Plex Home Theater": "device-icon-pht",
            "Firefox": "device-icon-firefox",
            "Chrome": "device-icon-chrome",
            "Internet Explorer": "device-icon-ie",
            "iOS": "device-icon-ios",
            "Android": "device-icon-android",
            "Samsung": "device-icon-samsung"
        },
        typeIcons: {
            "episode": "glyphicon display",
            "movie": "glyphicon film"
        }
    };
})
.config(["$routeProvider", function ($routeProvider) {
    $routeProvider
        .when("/home", {
            controller: "HomeCtrl",
            templateUrl: "partials/home.html"
        })
        .when("/settings", {
            controller: "SettingsCtrl",
            templateUrl: "partials/settings.html"
        })
        .when("/users", {
            controller: "UsersCtrl",
            templateUrl: "partials/users.html"
        })
        .when("/users/:user", {
            controller: "UserCtrl",
            templateUrl: "partials/user.html"
        })
        .when("/statistics", {
            controller: "StatisticsCtrl",
            templateUrl: "partials/statistics.html"
        })
        .when("/details/:item", {
            controller: "DetailsCtrl",
            templateUrl: "partials/details/index.html"
        })
        .otherwise({ redirectTo: "/home" })
        ;
}])
.run(function ($rootScope, PWWWService, localStorageService, $location, myPlex) {
    PWWWService.getSettings().then(function (settings) {
        $rootScope.settings = settings;
    }, function () {
        $location.path("/check");
    });

    /*
    myPlex.init();

    $rootScope.plex = {
        token: myPlex.token()
    };
    */
})
;



function HomeCtrl ($scope) {

}

function RecentlyWatchedCtrl ($scope, $http, $filter, ngTableParams, PlexWatch) {
    var watched = [];

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            time: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                $filter("orderBy")(watched, params.orderBy()) :
                watched;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    PlexWatch.Watched.query({}, function (data) {
        watched = data;
        $scope.tableParams.total(watched.length);
        $scope.tableParams.reload();
    });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.min = Math.min;
    $scope.max = Math.max;
}

function WatchedRowCtrl ($scope) {
    (function () {
        var src = $scope.w.thumb;
        if ($scope.w.type === "episode") {
            src = $scope.w.parentThumb;
        }

        if (src !== "") {
            $scope.w.thumbsrc = "backend/image.php?width=100&height=145&url=" + src;
        } else {
            $scope.w.thumbsrc = "img/posters/standard.png";
        }
    })();

    (function () {
        var templates = {
            "episode": "partials/watchedRow/episode.html",
            "movie": "partials/watchedRow/movie.html"
        };
        var template = "partials/watched/row.html";

        if (templates.hasOwnProperty($scope.w.type)) {
            template = templates[$scope.w.type];
        }
        $scope.w.template = template;
    })();
}

function SettingsCtrl ($scope, $rootScope, $location, PWWWService) {
    $scope.containers = [
        {
            title: "PlexWWWatch",
            template: "partials/settings/PlexWWWatch.html",
        },
        {
            title: "Plex Watch",
            template: "partials/settings/PlexWatch.html",
        },
        {
            title: "Plex",
            template: "partials/settings/Plex.html",
        },

    ];
    $scope.current = 2;
    $scope.loading = false;
    $scope.message = "";

    $scope.select = function (index) {
        $scope.current = index;
    };

    $scope.newSettings = {
        plex: {},
        plexWatch: {},
        plexWWWatch: {}
    };

    PWWWService.settings.all().then(function (settings) {
        $scope.newSettings = settings;
    });

    $scope.save = function (settings) {
        $scope.loading = true;
        PWWWService.settings.save(settings).then(function (settings) {
            $scope.loading = false;
        });
    };
}

function UsersCtrl ($scope, PlexWatch, ngTableParams, $filter) {
    var users = [];

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 25,
        sorting: {
            name: "asc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                $filter("orderBy")(users, params.orderBy()) :
                users;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    PlexWatch.Users.query({}, function (data) {
        users = data;
        $scope.tableParams.total(users.length);
        $scope.tableParams.reload();
    });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.min = Math.min;
    $scope.max = Math.max;

}

function UserRowCtrl ($scope) {
    (function () {
        var thumb = "img/userThumb.png";
        if ($scope.user.thumb === "") {
            $scope.user.thumb = thumb;
        }
    })();
}

function UserCtrl ($scope, $routeParams, PlexWatch, plexWWWatchConstants) {
    $scope.user = {
        watched: [],
        thumb: "img/userThumb.png"
    };
    $scope.selectedStats = "watched";

    (function () {
        var thumb = "img/userThumb.png";
        if ($scope.user.thumb === "") {
            $scope.user.thumb = thumb;
        }
    })();

    PlexWatch.Users.get({user: $routeParams.user}, function (data) {
        $scope.user = data;
    });

    $scope.deviceIcon = function (device) {
        var icon = plexWWWatchConstants.deviceIcons[device.platform];
        if (icon) {
            return icon;
        }
        return "device-icon-default";
    };

    $scope.typeIcon = function (type) {
        var icon = plexWWWatchConstants.typeIcons[type];
        if (icon) {
            return icon;
        }
        return "";
    };
}

function UserRecentlyWatchedCtrl ($scope, ngTableParams, $filter) {
    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            time: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var filteredData = $filter("filter")($scope.user.watched, function (watched) {
                var ret = false;
                angular.forEach($scope.user.devices, function (device, name) {
                    if (watched.device === name) {
                        ret = device.selected;
                    }
                });
                return ret;
            });

            var orderedData = params.sorting() ?
                $filter("orderBy")(filteredData, params.orderBy()) :
                filteredData;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    $scope.$watch("user.watched", function() {
        if ($scope.user.watched.length > 0) {
            $scope.tableParams.total($scope.user.watched.length);
            $scope.tableParams.reload();
        }
    });

    $scope.$watch("user.devices", function () {
        if ($scope.user.watched.length > 0) {
            $scope.tableParams.reload();
        }
    }, true);

    $scope.min = Math.min;
    $scope.max = Math.max;
}

function CheckCtrl ($scope, $location, PWWWService) {
    $scope.errors = [];
    PWWWService.check().then(function () {
        $location.path("/home");
    }, function (err) {
        $scope.errors = err;
    });
}

function RecentlyAddedCtrl ($scope, $window, PWWWService) {
    var itemWidth = 174;
    var listWidth = 0;
    var stepSize = $window.innerWidth * 0.9;

    $scope.positionStyle = {
        "-webkit-transform": "translate(0, 0)"
    };
    $scope.listWidthStyle = {
        width: 0
    };

    $scope.page = 1;
    $scope.pages = 1;
    $scope.items = [];

    $scope.recentlyAdded = PWWWService.recentlyAdded.query({}, function (data) {
        listWidth = data.length * itemWidth;
        $scope.pages = Math.ceil(listWidth / stepSize);
        $scope.page = 1;

        $scope.items = data;
        $scope.listWidthStyle = {
            width: listWidth + "px"
        };

    });

    $scope.$watch("page", function () {
        var xpos = "-" + ( ($scope.page - 1) * stepSize);
        $scope.positionStyle = {
            "-webkit-transform": "translate(" + xpos + "px, 0)"
        };
    });

    $scope.min = Math.min;
    $scope.max = Math.max;

}

function RecentlyAddedItemCtrl ($scope) {
    (function () {
        var templates = {
            "season": "partials/recentlyAdded/season.html",
            "movie": "partials/recentlyAdded/movie.html",
            "album": "partials/recentlyAdded/album.html"
        };
        var template = "partials/recentlyAdded/item.html";

        if (templates.hasOwnProperty($scope.item.type)) {
            template = templates[$scope.item.type];
        }
        $scope.item.template = template;
    })();

    (function () {
        if ($scope.item.thumb !== "") {
            $scope.item.thumbsrc = "backend/image.php?width=150&height=225&url=" + $scope.item.thumb;
        } else {
            $scope.item.thumbsrc = "img/posters/standard.png";
        }
    })();
}

function FetchPlexTokenCtrl ($scope, myPlex) {
    $scope.fetch = function (username, password) {
        $scope.myPlexMessage = "";
        $scope.myplex.password = "";
        myPlex.token(username, password).then(function (token) {
            $scope.$parent.newSettings.plex.token = token;
        }, function (error) {
            $scope.myPlexMessage = error;
        });
    };
}

function StatisticsCtrl ($scope, $filter, PWWWService) {
    $scope.selectedStats = "last30";

    $scope.dayOfMonthData = {
        watches: [],
        time: []
    };
    $scope.hourOfDayData = {
        watches: [],
        time: []
    };
    $scope.dayOfWeekData = {
        watches: [],
        time: []
    };
    $scope.last30Data = {
        watches: [],
        time: []
    };

    $scope.integer = function (z) {
        return Math.round(z);
    };

    $scope.duration = function (n) {
        return $filter("duration")(n);
    };

    $scope.date = function (d) {
        var m = moment.unix(d);
        return m.format("MMM-DD");
    };

    $scope.statistics = PWWWService.statistics.get({}, function (data) {
        var dayOfMonth = {
            watches: [],
            time: []
        };
        dayOfMonth.watches.push({
            key: "Movies",
            values: data.total.numWatches.dayOfMonth.movie
        });
        dayOfMonth.watches.push({
            key: "Episodes",
            values: data.total.numWatches.dayOfMonth.episode
        });
        dayOfMonth.time.push({
            key: "Movies",
            values: data.total.timeWatched.dayOfMonth.movie
        });
        dayOfMonth.time.push({
            key: "Episodes",
            values: data.total.timeWatched.dayOfMonth.episode
        });
        $scope.dayOfMonthData = dayOfMonth;

        var hourOfDay = {
            watches: [],
            time: []
        };
        hourOfDay.watches.push({
            key: "Movies",
            values: data.total.numWatches.hourOfDay.movie
        });
        hourOfDay.watches.push({
            key: "Episodes",
            values: data.total.numWatches.hourOfDay.episode
        });
        $scope.hourOfDayData = hourOfDay;

        var dayOfWeek = {
            watches: [],
            time: []
        };
        dayOfWeek.watches.push({
            key: "Movies",
            values: data.total.numWatches.dayOfWeek.movie
        });
        dayOfWeek.watches.push({
            key: "Episodes",
            values: data.total.numWatches.dayOfWeek.episode
        });
        dayOfWeek.time.push({
            key: "Movies",
            values: data.total.timeWatched.dayOfWeek.movie
        });
        dayOfWeek.time.push({
            key: "Episodes",
            values: data.total.timeWatched.dayOfWeek.episode
        });
        $scope.dayOfWeekData = dayOfWeek;

        var last30 = {
            watches: [],
            time: []
        };
        last30.watches.push({
            key: "Movies",
            values: data.last30.numWatches.movie
        });
        last30.watches.push({
            key: "Episodes",
            values: data.last30.numWatches.episode
        });
        last30.time.push({
            key: "Movies",
            values: data.last30.timeWatched.movie
        });
        last30.time.push({
            key: "Episodes",
            values: data.last30.timeWatched.episode
        });
        $scope.last30Data = last30;
    });
}

function DetailsCtrl ($scope, $routeParams, PlexWatch, Plex) {
    $scope.plexItem = {};
    $scope.watched = [];
    $scope.plexWatchItem = {};

    var templates = {
        "movie":   "partials/details/movie.html",
        "episode": "partials/details/episode.html",
        "season": "partials/details/season.html"
    };

    $scope.template = "";

    $scope.plexItem = Plex.Item.get({item: $routeParams.item}, function (plexItem) {
        if (templates.hasOwnProperty(plexItem.type)) {
            $scope.template = templates[plexItem.type];
        }
    });

    PlexWatch.Item.get({item: $routeParams.item}, function (data) {
        $scope.plexWatchItem = data.item;
        $scope.watched = data.watched;
    });
}

function DetailsEpisodeCtrl ($scope) {
    (function () {
        $scope.posterImage = "backend/image.php?width=280&height=157&url=" + $scope.plexItem.thumb;
    })();
}

function DetailsMovieCtrl ($scope) {
    (function () {
        $scope.posterImage = "backend/image.php?width=280&height=420&url=" + $scope.plexItem.thumb;
    })();
}

function DetailsSeasonCtrl ($scope, $routeParams, Plex) {
    $scope.children = Plex.Children.query({item: $routeParams.item });

    $scope.poster = function (thumb) {
        console.log("backend/image.php?width=280&height=157&url=" + thumb);
        return "backend/image.php?width=280&height=157&url=" + thumb;
    }
}

function DetailsRecentlyWatchedCtrl ($scope, $filter, ngTableParams) {
    $scope.tableParams = new ngTableParams({
        page: 1,
        count: 10,
        sorting: {
            time: "desc"
        }
    }, {
        total: 0,
        getData: function($defer, params) {
            var orderedData = params.sorting() ?
                $filter("orderBy")($scope.watched, params.orderBy()) :
                $scope.watched;
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
     });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.min = Math.min;
    $scope.max = Math.max;
}

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

(function(angular, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(angular || null, function(angular) {
    'use strict';
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

/**
 * @ngdoc module
 * @name ngTable
 * @description ngTable: Table + Angular JS
 * @example
 <doc:example>
 <doc:source>
 <script>
 var app = angular.module('myApp', ['ngTable']);
 app.controller('MyCtrl', function($scope) {
                    $scope.users = [
                        {name: "Moroni", age: 50},
                        {name: "Tiancum", age: 43},
                        {name: "Jacob", age: 27},
                        {name: "Nephi", age: 29},
                        {name: "Enos", age: 34}
                    ];
                });
 </script>
 <table ng-table class="table">
 <tr ng-repeat="user in users">
 <td data-title="'Name'">{{user.name}}</td>
 <td data-title="'Age'">{{user.age}}</td>
 </tr>
 </table>
 </doc:source>
 </doc:example>
 */
var app = angular.module('ngTable', []);
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

/**
 * @ngdoc service
 * @name ngTable.factory:ngTableParams
 * @description Parameters manager for ngTable
 */
app.factory('ngTableParams', ['$q', '$log', function ($q, $log) {
    var isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    var ngTableParams = function (baseParameters, baseSettings) {
        var self = this,
            log = function () {
                if (settings.debugMode && $log.debug) {
                    $log.debug.apply(this, arguments);
                }
            };

        this.data = [];

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#parameters
         * @methodOf ngTable.factory:ngTableParams
         * @description Set new parameters or get current parameters
         *
         * @param {string} newParameters      New parameters
         * @param {string} parseParamsFromUrl Flag if parse parameters like in url
         * @returns {Object} Current parameters or `this`
         */
        this.parameters = function (newParameters, parseParamsFromUrl) {
            parseParamsFromUrl = parseParamsFromUrl || false;
            if (angular.isDefined(newParameters)) {
                for (var key in newParameters) {
                    var value = newParameters[key];
                    if (parseParamsFromUrl && key.indexOf('[') >= 0) {
                        var keys = key.split(/\[(.*)\]/).reverse()
                        var lastKey = '';
                        for (var i = 0, len = keys.length; i < len; i++) {
                            var name = keys[i];
                            if (name !== '') {
                                var v = value;
                                value = {};
                                value[lastKey = name] = (isNumber(v) ? parseFloat(v) : v);
                            }
                        }
                        if (lastKey === 'sorting') {
                            params[lastKey] = {};
                        }
                        params[lastKey] = angular.extend(params[lastKey] || {}, value[lastKey]);
                    } else {
                        params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) : newParameters[key]);
                    }
                }
                log('ngTable: set parameters', params);
                return this;
            }
            return params;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#settings
         * @methodOf ngTable.factory:ngTableParams
         * @description Set new settings for table
         *
         * @param {string} newSettings New settings or undefined
         * @returns {Object} Current settings or `this`
         */
        this.settings = function (newSettings) {
            if (angular.isDefined(newSettings)) {
                if (angular.isArray(newSettings.data)) {
                    //auto-set the total from passed in data
                    newSettings.total = newSettings.data.length;
                }
                settings = angular.extend(settings, newSettings);
                log('ngTable: set settings', settings);
                return this;
            }
            return settings;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#page
         * @methodOf ngTable.factory:ngTableParams
         * @description If parameter page not set return current page else set current page
         *
         * @param {string} page Page number
         * @returns {Object|Number} Current page or `this`
         */
        this.page = function (page) {
            return angular.isDefined(page) ? this.parameters({'page': page}) : params.page;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#total
         * @methodOf ngTable.factory:ngTableParams
         * @description If parameter total not set return current quantity else set quantity
         *
         * @param {string} total Total quantity of items
         * @returns {Object|Number} Current page or `this`
         */
        this.total = function (total) {
            return angular.isDefined(total) ? this.settings({'total': total}) : settings.total;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#count
         * @methodOf ngTable.factory:ngTableParams
         * @description If parameter count not set return current count per page else set count per page
         *
         * @param {string} count Count per number
         * @returns {Object|Number} Count per page or `this`
         */
        this.count = function (count) {
            // reset to first page because can be blank page
            return angular.isDefined(count) ? this.parameters({'count': count, 'page': 1}) : params.count;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#filter
         * @methodOf ngTable.factory:ngTableParams
         * @description If parameter page not set return current filter else set current filter
         *
         * @param {string} filter New filter
         * @returns {Object} Current filter or `this`
         */
        this.filter = function (filter) {
            return angular.isDefined(filter) ? this.parameters({'filter': filter}) : params.filter;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#sorting
         * @methodOf ngTable.factory:ngTableParams
         * @description If 'sorting' parameter is not set, return current sorting. Otherwise set current sorting.
         *
         * @param {string} sorting New sorting
         * @returns {Object} Current sorting or `this`
         */
        this.sorting = function (sorting) {
            if (arguments.length == 2) {
                var sortArray = {};
                sortArray[sorting] = arguments[1];
                this.parameters({'sorting': sortArray});
                return this;
            }
            return angular.isDefined(sorting) ? this.parameters({'sorting': sorting}) : params.sorting;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#isSortBy
         * @methodOf ngTable.factory:ngTableParams
         * @description Checks sort field
         *
         * @param {string} field     Field name
         * @param {string} direction Direction of sorting 'asc' or 'desc'
         * @returns {Array} Return true if field sorted by direction
         */
        this.isSortBy = function (field, direction) {
            return angular.isDefined(params.sorting[field]) && params.sorting[field] == direction;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#orderBy
         * @methodOf ngTable.factory:ngTableParams
         * @description Return object of sorting parameters for angular filter
         *
         * @returns {Array} Array like: [ '-name', '+age' ]
         */
        this.orderBy = function () {
            var sorting = [];
            for (var column in params.sorting) {
                sorting.push((params.sorting[column] === "asc" ? "+" : "-") + column);
            }
            return sorting;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#getData
         * @methodOf ngTable.factory:ngTableParams
         * @description Called when updated some of parameters for get new data
         *
         * @param {Object} $defer promise object
         * @param {Object} params New parameters
         */
        this.getData = function ($defer, params) {
            if (angular.isArray(this.data) && angular.isObject(params)) {
                $defer.resolve(this.data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            } else {
                $defer.resolve([]);
            }
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#getGroups
         * @methodOf ngTable.factory:ngTableParams
         * @description Return groups for table grouping
         */
        this.getGroups = function ($defer, column) {
            var defer = $q.defer();

            defer.promise.then(function (data) {
                var groups = {};
                angular.forEach(data, function (item) {
                    var groupName = angular.isFunction(column) ? column(item) : item[column];

                    groups[groupName] = groups[groupName] || {
                        data: []
                    };
                    groups[groupName]['value'] = groupName;
                    groups[groupName].data.push(item);
                });
                var result = [];
                for (var i in groups) {
                    result.push(groups[i]);
                }
                log('ngTable: refresh groups', result);
                $defer.resolve(result);
            });
            this.getData(defer, self);
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#generatePagesArray
         * @methodOf ngTable.factory:ngTableParams
         * @description Generate array of pages
         *
         * @param {boolean} currentPage which page must be active
         * @param {boolean} totalItems  Total quantity of items
         * @param {boolean} pageSize    Quantity of items on page
         * @returns {Array} Array of pages
         */
        this.generatePagesArray = function (currentPage, totalItems, pageSize) {
            var maxBlocks, maxPage, maxPivotPages, minPage, numPages, pages;
            maxBlocks = 11;
            pages = [];
            numPages = Math.ceil(totalItems / pageSize);
            if (numPages > 1) {
                pages.push({
                    type: 'prev',
                    number: Math.max(1, currentPage - 1),
                    active: currentPage > 1
                });
                pages.push({
                    type: 'first',
                    number: 1,
                    active: currentPage > 1
                });
                maxPivotPages = Math.round((maxBlocks - 5) / 2);
                minPage = Math.max(2, currentPage - maxPivotPages);
                maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
                minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
                var i = minPage;
                while (i <= maxPage) {
                    if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
                        pages.push({
                            type: 'more',
                            active: false
                        });
                    } else {
                        pages.push({
                            type: 'page',
                            number: i,
                            active: currentPage !== i
                        });
                    }
                    i++;
                }
                pages.push({
                    type: 'last',
                    number: numPages,
                    active: currentPage !== numPages
                });
                pages.push({
                    type: 'next',
                    number: Math.min(numPages, currentPage + 1),
                    active: currentPage < numPages
                });
            }
            return pages;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#url
         * @methodOf ngTable.factory:ngTableParams
         * @description Return groups for table grouping
         *
         * @param {boolean} asString flag indicates return array of string or object
         * @returns {Array} If asString = true will be return array of url string parameters else key-value object
         */
        this.url = function (asString) {
            asString = asString || false;
            var pairs = (asString ? [] : {});
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var item = params[key],
                        name = encodeURIComponent(key);
                    if (typeof item === "object") {
                        for (var subkey in item) {
                            if (!angular.isUndefined(item[subkey]) && item[subkey] !== "") {
                                var pname = name + "[" + encodeURIComponent(subkey) + "]";
                                if (asString) {
                                    pairs.push(pname + "=" + item[subkey]);
                                } else {
                                    pairs[pname] = item[subkey];
                                }
                            }
                        }
                    } else if (!angular.isFunction(item) && !angular.isUndefined(item) && item !== "") {
                        if (asString) {
                            pairs.push(name + "=" + encodeURIComponent(item));
                        } else {
                            pairs[name] = encodeURIComponent(item);
                        }
                    }
                }
            }
            return pairs;
        };

        /**
         * @ngdoc method
         * @name ngTable.factory:ngTableParams#reload
         * @methodOf ngTable.factory:ngTableParams
         * @description Reload table data
         */
        this.reload = function () {
            var $defer = $q.defer(),
                self = this;

            settings.$loading = true;
            if (settings.groupBy) {
                settings.getGroups($defer, settings.groupBy, this);
            } else {
                settings.getData($defer, this);
            }
            log('ngTable: reload data');
            $defer.promise.then(function (data) {
                settings.$loading = false;
                log('ngTable: current scope', settings.$scope);
                if (settings.groupBy) {
                    self.data = settings.$scope.$groups = data;
                } else {
                    self.data = settings.$scope.$data = data;
                }
                settings.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
            });
        };

        this.reloadPages = function () {
            var self = this;
            settings.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
        };

        var params = this.$params = {
            page: 1,
            count: 1,
            filter: {},
            sorting: {},
            group: {},
            groupBy: null
        };
        var settings = {
            $scope: null, // set by ngTable controller
            $loading: false,
            data: null, //allows data to be set when table is initialized
            total: 0,
            defaultSort: 'desc',
            filterDelay: 750,
            counts: [10, 25, 50, 100],
            getGroups: this.getGroups,
            getData: this.getData
        };

        this.settings(baseSettings);
        this.parameters(baseParameters, true);
        return this;
    };
    return ngTableParams;
}]);

/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

/**
 * @ngdoc object
 * @name ngTable.directive:ngTable.ngTableController
 *
 * @description
 * Each {@link ngTable.directive:ngTable ngTable} directive creates an instance of `ngTableController`
 */
var ngTableController = ['$scope', 'ngTableParams', '$q', function ($scope, ngTableParams, $q) {
    $scope.$loading = false;

    if (!$scope.params) {
        $scope.params = new ngTableParams();
    }
    $scope.params.settings().$scope = $scope;

    var delayFilter = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    $scope.$watch('params.$params', function (newParams, oldParams) {
        $scope.params.settings().$scope = $scope;

        if (!angular.equals(newParams.filter, oldParams.filter)) {
            delayFilter(function () {
                $scope.params.reload();
            }, $scope.params.settings().filterDelay);
        } else {
            $scope.params.reload();
        }
    }, true);

    $scope.sortBy = function (column, event) {
        var parsedSortable = $scope.parse(column.sortable);
        if (!parsedSortable) {
            return;
        }
        var defaultSort = $scope.params.$params.defaultSort;
        var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
        var sorting = $scope.params.sorting() && $scope.params.sorting()[parsedSortable] && ($scope.params.sorting()[parsedSortable] === defaultSort);
        var sortingParams = event.ctrlKey ? $scope.params.sorting() : {};
        sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);
        $scope.params.parameters({
            sorting: sortingParams
        });
    };
}];
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

/**
 * @ngdoc directive
 * @name ngTable.directive:ngTable
 * @restrict A
 *
 * @description
 * Directive that instantiates {@link ngTable.directive:ngTable.ngTableController ngTableController}.
 */
app.directive('ngTable', ['$compile', '$q', '$parse',
    function ($compile, $q, $parse) {
        'use strict';

        return {
            restrict: 'A',
            priority: 1001,
            scope: true,
            controller: ngTableController,
            compile: function (element) {
                var columns = [], i = 0, row = null;

                // custom header
                var thead = element.find('thead');

                // IE 8 fix :not(.ng-table-group) selector
                angular.forEach(angular.element(element.find('tr')), function (tr) {
                    tr = angular.element(tr);
                    if (!tr.hasClass('ng-table-group') && !row) {
                        row = tr;
                    }
                });
                if (!row) {
                    return;
                }
                angular.forEach(row.find('td'), function (item) {
                    var el = angular.element(item);
                    if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
                        return;
                    }
                    var parsedAttribute = function (attr, defaultValue) {
                        return function (scope) {
                            return $parse(el.attr('x-data-' + attr) || el.attr('data-' + attr) || el.attr(attr))(scope, {
                                $columns: columns
                            }) || defaultValue;
                        };
                    };

                    var parsedTitle = parsedAttribute('title', ' '),
                        headerTemplateURL = parsedAttribute('header', false),
                        filter = parsedAttribute('filter', false)(),
                        filterTemplateURL = false,
                        filterName = false;

                    if (filter && filter.name) {
                        filterName = filter.name;
                        delete filter.name;
                    }
                    if (filter && filter.templateURL) {
                        filterTemplateURL = filter.templateURL;
                        delete filter.templateURL;
                    }

                    el.attr('data-title-text', parsedTitle()); // this used in responsive table
                    columns.push({
                        id: i++,
                        title: parsedTitle,
                        sortable: parsedAttribute('sortable', false),
                        'class': el.attr('x-data-header-class') || el.attr('data-header-class') || el.attr('header-class'),
                        filter: filter,
                        filterTemplateURL: filterTemplateURL,
                        filterName: filterName,
                        headerTemplateURL: headerTemplateURL,
                        filterData: (el.attr("filter-data") ? el.attr("filter-data") : null),
                        show: (el.attr("ng-show") ? function (scope) {
                            return $parse(el.attr("ng-show"))(scope);
                        } : function () {
                            return true;
                        })
                    });
                });
                return function (scope, element, attrs) {
                    scope.$loading = false;
                    scope.$columns = columns;

                    scope.$watch(attrs.ngTable, (function (params) {
                        if (angular.isUndefined(params)) {
                            return;
                        }
                        scope.paramsModel = $parse(attrs.ngTable);
                        scope.params = params;
                    }), true);
                    scope.parse = function (text) {
                        return angular.isDefined(text) ? text(scope) : '';
                    };
                    if (attrs.showFilter) {
                        scope.$parent.$watch(attrs.showFilter, function (value) {
                            scope.show_filter = value;
                        });
                    }
                    angular.forEach(columns, function (column) {
                        var def;
                        if (!column.filterData) {
                            return;
                        }
                        def = $parse(column.filterData)(scope, {
                            $column: column
                        });
                        if (!(angular.isObject(def) && angular.isObject(def.promise))) {
                            throw new Error('Function ' + column.filterData + ' must be instance of $q.defer()');
                        }
                        delete column.filterData;
                        return def.promise.then(function (data) {
                            if (!angular.isArray(data)) {
                                data = [];
                            }
                            data.unshift({
                                title: '-',
                                id: ''
                            });
                            column.data = data;
                        });
                    });
                    if (!element.hasClass('ng-table')) {
                        scope.templates = {
                            header: (attrs.templateHeader ? attrs.templateHeader : 'ng-table/header.html'),
                            pagination: (attrs.templatePagination ? attrs.templatePagination : 'ng-table/pager.html')
                        };
                        var headerTemplate = thead.length > 0 ? thead : angular.element(document.createElement('thead')).attr('ng-include', 'templates.header');
                        var paginationTemplate = angular.element(document.createElement('div')).attr('ng-include', 'templates.pagination');
                        element.find('thead').remove();
                        var tbody = element.find('tbody');
                        element.prepend(headerTemplate);
                        $compile(headerTemplate)(scope);
                        $compile(paginationTemplate)(scope);
                        element.addClass('ng-table');
                        return element.after(paginationTemplate);
                    }
                };
            }
        }
    }
]);

angular.module('ngTable').run(['$templateCache', function ($templateCache) {
    $templateCache.put('ng-table/filters/select-multiple.html', '<select ng-options="data.id as data.title for data in column.data" multiple ng-multiple="true" ng-model="params.filter()[name]" ng-show="filter==\'select-multiple\'" class="filter filter-select-multiple form-control" name="{{column.filterName}}"> </select>');
    $templateCache.put('ng-table/filters/select.html', '<select ng-options="data.id as data.title for data in column.data" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{column.filterName}}"> </select>');
    $templateCache.put('ng-table/filters/text.html', '<input type="text" name="{{column.filterName}}" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control"/>');
    $templateCache.put('ng-table/header.html', '<tr> <th ng-repeat="column in $columns" ng-class="{ \'sortable\': parse(column.sortable), \'sort-asc\': params.sorting()[parse(column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse(column.sortable)]==\'desc\' }" ng-click="sortBy(column, $event)" ng-show="column.show(this)" ng-init="template=column.headerTemplateURL(this)" class="header {{column.class}}"> <div ng-if="!template" ng-show="!template" ng-bind="parse(column.title)"></div> <div ng-if="template" ng-show="template"><div ng-include="template"></div></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th ng-repeat="column in $columns" ng-show="column.show(this)" class="filter"> <div ng-repeat="(name, filter) in column.filter"> <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL"> <div ng-include="column.filterTemplateURL"></div> </div> <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL"> <div ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </div> </th> </tr>');
    $templateCache.put('ng-table/pager.html', '<div class="ng-cloak ng-table-pager"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ');
}]);
    return app;
}));
