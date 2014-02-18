angular.module("plex",
    [
        "base64",
        "LocalStorageModule"
    ])
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

    this.token = function () {
        if (!user) {
            return null;
        }
        return user.authentication_token;
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
            deferred.resolve(data);
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
