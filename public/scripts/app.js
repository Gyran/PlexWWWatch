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
.factory("plexWWWatchConstants", function () {
    return {
        deviceIcons: {
            "Plex Home Theater": "device-icon-pht",
            "Firefox": "device-icon-firefox",
            "Chrome": "device-icon-chrome",
            "Internet Explorer": "device-icon-ie",
            "iOS": "device-icon-ios",
            "Android": "device-icon-android"
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
        .when("/users/:user", {
            controller: "UserCtrl",
            templateUrl: "partials/user.html"
        })
        .when("/plex", {
            controller: "PlexCtrl",
            templateUrl: "partials/plex.html"
        })
        .otherwise({ redirectTo: "/home" })
        ;
}])
.run(function ($rootScope, Settings, localStorageService, $templateCache) {
    Settings.get().then(function (promise) {
        $rootScope.settings = promise.data;
    });

    $rootScope.plex = {
        token: localStorageService.get("plexToken")
    };
})
;


