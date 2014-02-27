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

/*
    this.recentlyAdded = function () {
        var deferred = $q.defer();
        $http.get("backend/recentlyAdded.php").success(function (data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };
*/

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


