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
        "ngPlexWatch"
    ])
.service("Settings", function ($http) {
    this.save = function (settings) {
        var promise = $http.post("backend/settings.php", settings).success(function (data) {
            return data;
        });
        return promise;
    };

    this.get = function () {
        var promise = $http.get("backend/settings.php").success(function (data) {
            if (data) {
                return data;
            }
        });
        return promise;
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
            templateUrl: "partials/settings.html",
            resolve: {
                settings: function (Settings) {
                    return Settings;
                }
            }
        })
        .when("/users", {
            controller: "UsersCtrl",
            templateUrl: "partials/users.html"
        })
        .otherwise({ redirectTo: "/home" })
        ;
}])
.run(function ($rootScope, Settings, localStorageService) {
    Settings.get().then(function (promise) {
        $rootScope.settings = promise.data;
    });

    $rootScope.plex = {
        token: localStorageService.get("plexToken")
    };
})
;

function HomeCtrl ($scope, $http, $filter, ngTableParams) {

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
}



function WatchedRowCtrl ($scope) {
    /*
    (function () {
        var percent = ($scope.w.viewOffset / $scope.w.duration) * 100;
        if (percent > 90) {
            $scope.w.progress = 100    ;
        } else {
            $scope.w.progress = percent;
        }
    }());

    (function () {
        var start_time = $scope.w.time;
        var stop_time = 0;

        if ($scope.w.stopped > 0) {
            stop_time = $scope.w.stopped;
        } else if ($scope.w.paused > 0) {
            stop_time = $scope.w.paused;
        } else {
            stop_time = moment().valueOf();
        }

        var ms = stop_time - start_time - $scope.w.pausedCounter;

        $scope.w.timeWatched = moment.duration(ms).humanize();
    }());


    (function () {
        $scope.w.timePaused = moment.duration($scope.w.pausedCounter).humanize();
    })();
    */

    (function () {
        var setThumb = function () {
            var thumb = "img/poster.png";
            if ($scope.w.thumb !== "") {
                thumb = $scope.settings.plexMediaServerHost + $scope.w.thumb;
                if ($scope.plex.token) {
                    thumb = thumb + "?X-Plex-Token=" + $scope.plex.token;
                }
            }
            $scope.w.thumbsrc = thumb;
        };

        $scope.$watch("plex.token", function () {
            setThumb();
        });

        setThumb();

    })();

    (function () {
        var templates = {
            "episode": "partials/watchedRowEpisode.html",
            "movie": "partials/watchedRowMovie.html"
        };
        var template = "partials/watchedRow.html";

        if (templates.hasOwnProperty($scope.w.type)) {
            template = templates[$scope.w.type];
        }
        $scope.w.template = template;
    })();

    $scope.duration = function (ms) {
        return moment.duration(ms).humanize();
    };
}

function SettingsCtrl ($scope, $rootScope, Settings) {
    $scope.save = function (settings) {
        Settings.save(settings).then(function (promise) {
            $rootScope.settings = promise.data;
        });
    };
}

function UsersCtrl ($scope, PlexWatch) {
    $scope.users = PlexWatch.Users.query();
}

function UserCtrl ($scope) {
    (function () {
        var thumb = "img/userThumb.png";
        if ($scope.user.thumb === "") {
            $scope.user.thumb = thumb;
        }
    })();
}
