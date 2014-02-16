angular.module("plex",
    [
        "base64",
        "LocalStorageModule"
    ])
.service("myPlex", function ($http, $base64, $q) {
    var user = {};
    var signedin = false;

    this.token = function (username, password) {
        var deferred = $q.defer();

        if (user.authentication_token) {
            deferred.resolve(user.authentication_token);
        } else if (username && password) {
            _signin(username, password).then(function () {
                deferred.resolve(user.authentication_token);
            }, function (reason) {
                deferred.reject(reason);
            });
        } else {
            deferred.reject("No token found and no username and password supplied");
        }

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
                "X-Plex-Client-Identifier": "PlexWWWatch",
                "X-Plex-Product": "Web Client",
                "X-Plex-Version": "0.1"
            }
        }).success(function (data) {
            user = data.user;
            deferred.resolve();
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
        myPlex.token($scope.username, $scope.password).then(function (token) {
            $rootScope.plex.token = token;

            if ($scope.remember) {
                localStorageService.add("plexToken", token);
            }

        }, function (error) {
            $scope.error = error;
        });

        $scope.password = "";
    };

    $scope.signout = function () {
        $scope.error = false;
        $scope.plex.token = "";

        // delete remember
        localStorageService.remove("plexToken");
    };

}
