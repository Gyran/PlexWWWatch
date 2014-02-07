angular.module("plex-wwwatch",
    [
        "ngRoute",
        "ngResource",
        "angularMoment",
        "ngTable",
        "PlexWWWatchPartials"
    ])
.service("Settings", function ($http) {
    this.save = function (settings) {
        $http.post("backend/settings.php", settings).success(function (data) {
        });
    };

    this.get = function () {
        var promise = $http.get("backend/settings.php").success(function (data) {
            if (data) {
                return data;
            }
            return {
                dbPath: "/opt/plexWatch/plexWatch.db",
                grouped: false,
                plexMediaServerHost: "http://"
            };
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
        .otherwise({ redirectTo: "/home" })
        ;
}])
.run(function ($rootScope, Settings) {
    Settings.get().then(function (promise) {
        $rootScope.settings = promise.data;
    });
})
;

function HomeCtrl ($scope, $http, $filter, ngTableParams) {
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

    $http({method: "GET", url: "backend/watched.php"}).success(function (data) {
        watched = data;
        $scope.tableParams.total(watched.length);

        $scope.tableParams.reload();
    });

    $scope.pages = function () {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };

    $scope.progress = function (w) {
        var percent = w.viewOffset / w.duration * 100;
        if (percent > 90) {
            return 100;
        }
        return percent;
    };

    $scope.timeWatched = function (w) {
        var start_time = w.time;
        var stop_time = 0;

        if (w.stopped > 0) {
            stop_time = w.stopped;
        } else if (w.paused > 0) {
            stop_time = w.paused;
        } else {
            stop_time = moment().valueOf();
        }

        var ms = stop_time - start_time - w.pausedCounter;

        return moment.duration(ms).humanize();
    };

    $scope.thumb = function (w) {
        if (w.thumb === "") {
            return "img/poster.png";
        }
        return $scope.settings.plexMediaServerHost + w.thumb;
    };
}

function SettingsCtrl ($scope, Settings) {
    $scope.save = function (settings) {
        Settings.save(settings);
    };
}
